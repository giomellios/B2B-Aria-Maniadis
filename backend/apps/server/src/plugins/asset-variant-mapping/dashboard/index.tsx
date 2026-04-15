import {
    api,
    DataTableBulkActionItem,
    defineDashboardExtension,
} from '@vendure/dashboard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link2Icon } from 'lucide-react';
import { gql } from 'graphql-tag';
import { toast } from 'sonner';

interface AssetVariantMappingItem {
    assetId: string;
    assetName: string;
    filenameToken: string;
    status: 'MAPPED' | 'UNMATCHED' | 'FAILED';
    variantSku?: string;
    reason?: string;
}

interface AssetVariantMappingResult {
    totalAssets: number;
    mappedAssets: number;
    unmatchedAssets: number;
    failedAssets: number;
    updatedVariants: number;
    messages: string[];
    items: AssetVariantMappingItem[];
}

const MapAssetsToVariantsDocument = gql`
    mutation MapAssetsToVariantsByFilename($assetIds: [ID!]!) {
        mapAssetsToVariantsByFilename(assetIds: $assetIds) {
            totalAssets
            mappedAssets
            unmatchedAssets
            failedAssets
            updatedVariants
            messages
            items {
                assetId
                assetName
                filenameToken
                status
                variantSku
                reason
            }
        }
    }
`;

function MapAssetsBulkAction({ selection }: { selection: any[] }) {
    const queryClient = useQueryClient();

    const eligibleAssets = selection.filter(asset => {
        const name = getAssetName(asset);
        if (!name) {
            return false;
        }
        const token = extractFilenameToken(name);
        return SKU_FILENAME_PATTERN.test(token) && normalizeSkuToken(token).length > 0;
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const assetIds = eligibleAssets.map(asset => String(asset.id));
            const response = await api.mutate<{
                mapAssetsToVariantsByFilename: AssetVariantMappingResult;
            }>(MapAssetsToVariantsDocument, { assetIds });
            return (response as any)?.mapAssetsToVariantsByFilename as AssetVariantMappingResult;
        },
        onSuccess: result => {
            if (!result) {
                toast.error('No response returned by mapping mutation.');
                return;
            }

            if (result.mappedAssets > 0) {
                toast.success(
                    `Mapped ${result.mappedAssets}/${result.totalAssets} assets. Updated variants: ${result.updatedVariants}.`,
                );
            } else {
                toast.warning('No assets were mapped. Check filename-to-SKU matches and enabled products.');
            }

            if (result.unmatchedAssets > 0 || result.failedAssets > 0) {
                const sample = result.items
                    .filter(item => item.status !== 'MAPPED')
                    .slice(0, 5)
                    .map(item => {
                        const name = item.assetName || item.filenameToken || item.assetId;
                        return `${name}: ${item.reason ?? 'No reason provided.'}`;
                    })
                    .join('\n');

                const detailSuffix = sample ? `\n${sample}` : '';
                toast.warning(
                    `Skipped ${result.unmatchedAssets}, failed ${result.failedAssets}.${detailSuffix}`,
                );
            }

            queryClient.invalidateQueries();
        },
        onError: (error: any) => {
            const gqlErrors = error?.response?.errors ?? error?.errors;
            if (Array.isArray(gqlErrors) && gqlErrors.length > 0) {
                toast.error(gqlErrors.map((e: any) => e.message).join('\n'));
            } else {
                toast.error(error?.message ?? 'Failed to map assets to product variants.');
            }
        },
    });

    if (eligibleAssets.length === 0) {
        return null;
    }

    return (
        <DataTableBulkActionItem
            onClick={() => mutate()}
            label={isPending ? 'Mapping...' : `Map to Product (${eligibleAssets.length})`}
            icon={Link2Icon}
        />
    );
}

defineDashboardExtension({
    dataTables: [
        {
            pageId: 'asset-list',
            blockId: 'asset-gallery',
            bulkActions: [
                {
                    component: props => <MapAssetsBulkAction selection={props.selection} />,
                },
            ],
        },
    ],
});

const SKU_FILENAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}_\-. ]*$/u;

function getAssetName(asset: any): string {
    return String(asset?.name ?? asset?.source ?? '').trim();
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
