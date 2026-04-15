import { Injectable, Logger } from '@nestjs/common';
import {
    Asset,
    ProductVariant,
    RequestContext,
    TransactionalConnection,
} from '@vendure/core';
import {
    AssetVariantMappingItem,
    AssetVariantMappingResult,
} from '../types';

type VariantLookup =
    | { type: 'match'; variantId: string; variantSku: string }
    | { type: 'unmatched'; reason: string };

interface PendingAssignment {
    assetId: string;
    assetName: string;
    filenameToken: string;
    variantId: string;
    variantSku: string;
}

@Injectable()
export class AssetVariantMappingService {
    private readonly logger = new Logger(AssetVariantMappingService.name);

    constructor(private readonly connection: TransactionalConnection) {}

    async mapAssetsToVariantsByFilename(
        ctx: RequestContext,
        assetIds: string[],
    ): Promise<AssetVariantMappingResult> {
        const uniqueAssetIds = uniquePreservingOrder(assetIds.map(String));
        const items: AssetVariantMappingItem[] = [];
        const messages: string[] = [];

        if (uniqueAssetIds.length === 0) {
            return {
                totalAssets: 0,
                mappedAssets: 0,
                unmatchedAssets: 0,
                failedAssets: 0,
                updatedVariants: 0,
                messages: ['No assets selected.'],
                items: [],
            };
        }

        const assets = await this.getAssetsByIds(ctx, uniqueAssetIds);
        const assetsById = new Map(assets.map(asset => [String(asset.id), asset]));
        const lookupCache = new Map<string, VariantLookup>();
        const assignmentsByVariant = new Map<string, PendingAssignment[]>();

        for (const assetId of uniqueAssetIds) {
            const asset = assetsById.get(assetId);
            if (!asset) {
                items.push({
                    assetId,
                    assetName: '',
                    filenameToken: '',
                    status: 'FAILED',
                    reason: 'Asset not found or no longer accessible.',
                });
                continue;
            }

            const assetName = getAssetName(asset);
            const filenameToken = extractFilenameToken(assetName);
            const skuCandidates = deriveSkuCandidates(filenameToken);

            if (skuCandidates.length === 0) {
                items.push({
                    assetId,
                    assetName,
                    filenameToken,
                    status: 'UNMATCHED',
                    reason: 'Filename does not contain a valid SKU token.',
                });
                continue;
            }

            const lookup = await this.lookupVariant(ctx, skuCandidates, lookupCache);
            if (lookup.type === 'unmatched') {
                items.push({
                    assetId,
                    assetName,
                    filenameToken,
                    status: 'UNMATCHED',
                    reason: lookup.reason,
                });
                continue;
            }

            const pending: PendingAssignment = {
                assetId,
                assetName,
                filenameToken,
                variantId: lookup.variantId,
                variantSku: lookup.variantSku,
            };
            const existing = assignmentsByVariant.get(lookup.variantId) ?? [];
            existing.push(pending);
            assignmentsByVariant.set(lookup.variantId, existing);
        }

        let updatedVariants = 0;

        for (const [variantId, assignments] of assignmentsByVariant.entries()) {
            const sortedAssignments = sortAssignmentsByInputOrder(assignments, uniqueAssetIds);
            try {
                const updateOutcome = await this.applyVariantAssetUpdate(ctx, variantId, sortedAssignments);
                if (updateOutcome.didUpdate) {
                    updatedVariants += 1;
                }

                for (const assignment of sortedAssignments) {
                    items.push({
                        assetId: assignment.assetId,
                        assetName: assignment.assetName,
                        filenameToken: assignment.filenameToken,
                        status: 'MAPPED',
                        variantId,
                        variantSku: assignment.variantSku,
                        reason: updateOutcome.didUpdate ? undefined : 'Already mapped; no update needed.',
                    });
                }
            } catch (error: any) {
                const reason = error?.message ?? 'Variant update failed.';
                this.logger.error(
                    `Failed to map ${sortedAssignments.length} asset(s) to variant ${variantId}: ${reason}`,
                );

                for (const assignment of sortedAssignments) {
                    items.push({
                        assetId: assignment.assetId,
                        assetName: assignment.assetName,
                        filenameToken: assignment.filenameToken,
                        status: 'FAILED',
                        variantId,
                        variantSku: assignment.variantSku,
                        reason,
                    });
                }
            }
        }

        const mappedAssets = items.filter(item => item.status === 'MAPPED').length;
        const unmatchedAssets = items.filter(item => item.status === 'UNMATCHED').length;
        const failedAssets = items.filter(item => item.status === 'FAILED').length;

        messages.push(`Processed ${items.length} assets.`);
        if (mappedAssets > 0) {
            messages.push(`Mapped ${mappedAssets} assets to ${updatedVariants} variants.`);
        }
        if (unmatchedAssets > 0) {
            messages.push(`${unmatchedAssets} assets were skipped (no SKU match).`);
        }
        if (failedAssets > 0) {
            messages.push(`${failedAssets} assets failed while updating variants.`);
        }

        return {
            totalAssets: uniqueAssetIds.length,
            mappedAssets,
            unmatchedAssets,
            failedAssets,
            updatedVariants,
            messages,
            items,
        };
    }

    private async getAssetsByIds(ctx: RequestContext, assetIds: string[]): Promise<Asset[]> {
        const repo = this.connection.getRepository(ctx, Asset);
        return repo
            .createQueryBuilder('asset')
            .where('asset.id IN (:...ids)', { ids: assetIds })
            .getMany();
    }

    private async lookupVariant(
        ctx: RequestContext,
        skuCandidates: string[],
        cache: Map<string, VariantLookup>,
    ): Promise<VariantLookup> {
        const attempted: string[] = [];

        for (const candidate of skuCandidates) {
            const normalizedSku = normalizeSkuToken(candidate);
            if (!normalizedSku) {
                continue;
            }

            attempted.push(candidate);
            const result = await this.lookupSingleSkuCandidate(ctx, candidate, normalizedSku, cache);
            if (result.type === 'match') {
                return result;
            }
        }

        const attemptedText = attempted.length ? attempted.join(', ') : skuCandidates.join(', ');
        return {
            type: 'unmatched',
            reason: `No product variant found for filename token "${skuCandidates[0]}". Tried SKU candidates: ${attemptedText}.`,
        };
    }

    private async lookupSingleSkuCandidate(
        ctx: RequestContext,
        rawSkuToken: string,
        normalizedSku: string,
        cache: Map<string, VariantLookup>,
    ): Promise<VariantLookup> {
        const cached = cache.get(normalizedSku);
        if (cached) {
            return cached;
        }

        const repo = this.connection.getRepository(ctx, ProductVariant);
        const channelId = String(ctx.channelId);
        const exactToken = rawSkuToken.trim();

        // 1) Prefer exact SKU match within the active channel.
        const exactMatches = await repo
            .createQueryBuilder('variant')
            .innerJoin('variant.channels', 'channel', 'channel.id = :channelId', { channelId })
            .leftJoinAndSelect('variant.product', 'product')
            .where('variant.sku = :sku', { sku: exactToken })
            .limit(25)
            .getMany();

        let result: VariantLookup;
        if (exactMatches.length === 1) {
            result = {
                type: 'match',
                variantId: String(exactMatches[0].id),
                variantSku: exactMatches[0].sku,
            };
            cache.set(normalizedSku, result);
            return result;
        }
        if (exactMatches.length > 1) {
            result = selectPreferredVariant(exactMatches, exactToken);
            cache.set(normalizedSku, result);
            return result;
        }

        // 2) Fallback to case-insensitive exact comparison (still channel-scoped).
        const caseInsensitiveMatches = await repo
            .createQueryBuilder('variant')
            .innerJoin('variant.channels', 'channel', 'channel.id = :channelId', { channelId })
            .leftJoinAndSelect('variant.product', 'product')
            .where('variant.sku ILIKE :sku', { sku: exactToken })
            .limit(25)
            .getMany();

        if (caseInsensitiveMatches.length === 1) {
            result = {
                type: 'match',
                variantId: String(caseInsensitiveMatches[0].id),
                variantSku: caseInsensitiveMatches[0].sku,
            };
            cache.set(normalizedSku, result);
            return result;
        }
        if (caseInsensitiveMatches.length > 1) {
            result = selectPreferredVariant(caseInsensitiveMatches, exactToken);
            cache.set(normalizedSku, result);
            return result;
        }

        // 3) Last-resort normalized match for filenames that differ in punctuation/accents.
        const prefix = exactToken.split('-')[0] || exactToken;
        const broadCandidates = await repo
            .createQueryBuilder('variant')
            .innerJoin('variant.channels', 'channel', 'channel.id = :channelId', { channelId })
            .leftJoinAndSelect('variant.product', 'product')
            .where('variant.sku ILIKE :prefix', { prefix: `${escapeLike(prefix)}%` })
            .limit(250)
            .getMany();
        const normalizedMatches = broadCandidates.filter(
            variant => normalizeSkuToken(variant.sku) === normalizedSku,
        );

        if (normalizedMatches.length === 0) {
            result = {
                type: 'unmatched',
                reason: `No product variant found for SKU "${exactToken}".`,
            };
        } else if (normalizedMatches.length > 1) {
            result = selectPreferredVariant(normalizedMatches, exactToken);
        } else {
            result = {
                type: 'match',
                variantId: String(normalizedMatches[0].id),
                variantSku: normalizedMatches[0].sku,
            };
        }

        cache.set(normalizedSku, result);
        return result;
    }

    private async applyVariantAssetUpdate(
        ctx: RequestContext,
        variantId: string,
        assignments: PendingAssignment[],
    ): Promise<{ didUpdate: boolean }> {
        const repo = this.connection.getRepository(ctx, ProductVariant);
        const variant = await repo.findOne({
            where: { id: variantId as any },
            relations: {
                assets: true,
                featuredAsset: true,
            },
        });

        if (!variant) {
            throw new Error(`Variant ${variantId} not found.`);
        }

        const existingAssetIds = (variant.assets ?? []).map(asset => String(asset.id));
        const incomingAssetIds = assignments.map(assignment => assignment.assetId);
        const mergedAssetIds = uniquePreservingOrder([...existingAssetIds, ...incomingAssetIds]);
        const assetsToAdd = mergedAssetIds.filter(assetId => !existingAssetIds.includes(assetId));

        const hasFeatured = Boolean(variant.featuredAsset?.id);
        const featuredAssetId = hasFeatured ? undefined : incomingAssetIds[0];

        const assetsChanged = assetsToAdd.length > 0;
        const featuredChanged = !hasFeatured && Boolean(featuredAssetId);

        if (!assetsChanged && !featuredChanged) {
            return { didUpdate: false };
        }

        if (assetsToAdd.length > 0) {
            await repo
                .createQueryBuilder()
                .relation(ProductVariant, 'assets')
                .of(variantId)
                .add(assetsToAdd);
        }

        if (featuredChanged && featuredAssetId) {
            await repo
                .createQueryBuilder()
                .relation(ProductVariant, 'featuredAsset')
                .of(variantId)
                .set(featuredAssetId);
        }

        return { didUpdate: true };
    }
}

function getAssetName(asset: Asset): string {
    return (asset.name || asset.source || '').trim();
}

function extractFilenameToken(fileName: string): string {
    const trimmed = fileName.trim();
    if (!trimmed) {
        return '';
    }

    const lastDotIndex = trimmed.lastIndexOf('.');
    if (lastDotIndex <= 0) {
        return trimmed;
    }

    return trimmed.slice(0, lastDotIndex).trim();
}

function normalizeSkuToken(token: string): string {
    return token
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/[^\p{L}\p{N}-]/gu, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toUpperCase();
}

function deriveSkuCandidates(token: string): string[] {
    const trimmed = token.trim();
    if (!trimmed) {
        return [];
    }

    const candidates = new Set<string>();
    candidates.add(trimmed);

    // Pattern: SKU__anything.ext -> map using the left side
    if (trimmed.includes('__')) {
        const [left] = trimmed.split('__');
        if (left.trim()) {
            candidates.add(left.trim());
        }
    }

    // Common duplicate/counter suffixes: "SKU (1)", "SKU-1", "SKU_2"
    const noParenCounter = trimmed.replace(/\s*\(\d+\)\s*$/u, '').trim();
    if (noParenCounter) {
        candidates.add(noParenCounter);
    }
    const noDashCounter = trimmed.replace(/[-_\s]+\d+$/u, '').trim();
    if (noDashCounter) {
        candidates.add(noDashCounter);
    }

    // Common image-view suffixes: front/back/side/detail/main/image/photo/pic (+ optional counter)
    const noViewSuffix = trimmed
        .replace(/[-_\s]+(front|back|side|detail|main|image|img|photo|pic)([-_\s]*\d+)?$/iu, '')
        .trim();
    if (noViewSuffix) {
        candidates.add(noViewSuffix);
    }

    return Array.from(candidates).filter(value => normalizeSkuToken(value).length > 0);
}

function escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, char => `\\${char}`);
}

function selectPreferredVariant(matches: ProductVariant[], sku: string): VariantLookup {
    if (matches.length === 0) {
        return {
            type: 'unmatched',
            reason: `No product variant found for SKU "${sku}".`,
        };
    }

    if (matches.length === 1) {
        return {
            type: 'match',
            variantId: String(matches[0].id),
            variantSku: matches[0].sku,
        };
    }

    const productEnabledMatches = matches.filter(match => match.product?.enabled === true);
    if (productEnabledMatches.length === 0) {
        return {
            type: 'unmatched',
            reason: `Multiple variants found for SKU "${sku}", but none belong to an enabled product.`,
        };
    }

    const preferredPool = productEnabledMatches.some(match => match.enabled)
        ? productEnabledMatches.filter(match => match.enabled)
        : productEnabledMatches;

    const preferred = [...preferredPool].sort((a, b) => {
        const aUpdated = new Date(a.updatedAt).getTime();
        const bUpdated = new Date(b.updatedAt).getTime();
        return bUpdated - aUpdated;
    })[0];

    return {
        type: 'match',
        variantId: String(preferred.id),
        variantSku: preferred.sku,
    };
}

function uniquePreservingOrder(values: string[]): string[] {
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const value of values) {
        if (seen.has(value)) {
            continue;
        }
        seen.add(value);
        unique.push(value);
    }

    return unique;
}

function sortAssignmentsByInputOrder(
    assignments: PendingAssignment[],
    orderedAssetIds: string[],
): PendingAssignment[] {
    const orderMap = new Map(orderedAssetIds.map((assetId, index) => [assetId, index]));
    return [...assignments].sort((a, b) => {
        const aIndex = orderMap.get(a.assetId) ?? Number.MAX_SAFE_INTEGER;
        const bIndex = orderMap.get(b.assetId) ?? Number.MAX_SAFE_INTEGER;
        return aIndex - bIndex;
    });
}
