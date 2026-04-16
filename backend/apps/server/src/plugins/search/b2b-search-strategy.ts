import { LogicalOperator } from '@vendure/common/lib/generated-types';
import { Brackets } from 'typeorm';
import {
    applyLanguageConstraints,
    createPlaceholderFromId,
} from '@vendure/core/dist/plugin/default-search-plugin/search-strategy/search-strategy-utils';

// Use require() to get the base class so TypeScript does not enforce the
// 'private' access modifier on applyTermAndFilters, allowing us to override it.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PostgresSearchStrategy } = require('@vendure/core/dist/plugin/default-search-plugin/search-strategy/postgres-search-strategy');

/**
 * Extends Vendure's default PostgresSearchStrategy to also match partial SKU
 * fragments via ILIKE. The default strategy uses PostgreSQL full-text search
 * (to_tsvector / to_tsquery) which tokenises e.g. "A1034" as a single token,
 * preventing suffix/contains matches. Typing "1034" now finds SKU "A1034".
 *
 * All other behaviour (facets, collections, stock, pagination, sorting) is
 * identical to the parent — we only add one OR clause inside the existing
 * Brackets block so the rest of the filters (channel, language, etc.) still
 * apply correctly via AND.
 */
export class B2BPostgresSearchStrategy extends PostgresSearchStrategy {
    // Redeclare to use in our override (parent's copy is private).
    private readonly minTermLength = 2;

    /**
     * Full reimplementation of the parent's private applyTermAndFilters,
     * with `OR si.sku ILIKE :skuFragment` added inside the FTS Brackets.
     */
    applyTermAndFilters(ctx: any, qb: any, input: any, forceGroup = false): any {
        const {
            term,
            facetValueFilters,
            facetValueIds,
            facetValueOperator,
            collectionId,
            collectionSlug,
        } = input;

        // Build a prefix-match tsquery: "A 1034" → "'A':* & '1034':*"
        const termLogicalAnd = term
            ? term
                  .trim()
                  .split(/\s+/g)
                  .map((t: string) => `'${t}':*`)
                  .join(' & ')
            : '';

        qb.where('1 = 1');

        // Diagnostic — remove after confirming the override is active
        console.log('[B2BSearch] applyTermAndFilters called, term:', term);

        if (term && term.length > this.minTermLength) {
            const minIfGrouped = (col: string) =>
                input.groupByProduct || forceGroup ? `MIN(${col})` : col;

            qb.addSelect(
                `(ts_rank_cd(to_tsvector(${minIfGrouped('si.sku')}), to_tsquery(:term)) * 10 +
                 ts_rank_cd(to_tsvector(${minIfGrouped('si.productName')}), to_tsquery(:term)) * 2 +
                 ts_rank_cd(to_tsvector(${minIfGrouped('si.productVariantName')}), to_tsquery(:term)) * 1.5 +
                 ts_rank_cd(to_tsvector(${minIfGrouped('si.description')}), to_tsquery(:term)) * 1)`,
                'score',
            )
                .andWhere(
                    new Brackets(qb1 => {
                        qb1.where('to_tsvector(si.sku) @@ to_tsquery(:term)')
                            .orWhere('to_tsvector(si.productName) @@ to_tsquery(:term)')
                            .orWhere('to_tsvector(si.productVariantName) @@ to_tsquery(:term)')
                            .orWhere('to_tsvector(si.description) @@ to_tsquery(:term)')
                            // B2B: partial SKU matching — "1034" finds "A1034"
                            .orWhere('si.sku ILIKE :skuFragment');
                    }),
                )
                .setParameters({ term: termLogicalAnd, skuFragment: `%${term.trim()}%` });
        }

        if (input.inStock != null) {
            if (input.groupByProduct) {
                qb.andWhere('si.productInStock = :inStock', { inStock: input.inStock });
            } else {
                qb.andWhere('si.inStock = :inStock', { inStock: input.inStock });
            }
        }

        if (facetValueIds?.length) {
            qb.andWhere(
                new Brackets(qb1 => {
                    for (const id of facetValueIds) {
                        const placeholder = createPlaceholderFromId(id);
                        const clause = `:${placeholder}::varchar = ANY (string_to_array(si.facetValueIds, ','))`;
                        const params = { [placeholder]: id };
                        if (facetValueOperator === LogicalOperator.AND) {
                            qb1.andWhere(clause, params);
                        } else {
                            qb1.orWhere(clause, params);
                        }
                    }
                }),
            );
        }

        if (facetValueFilters?.length) {
            qb.andWhere(
                new Brackets(qb1 => {
                    for (const facetValueFilter of facetValueFilters) {
                        qb1.andWhere(
                            new Brackets(qb2 => {
                                if (facetValueFilter.and && facetValueFilter.or?.length) {
                                    throw new Error('error.facetfilterinput-invalid-input');
                                }
                                if (facetValueFilter.and) {
                                    const placeholder = createPlaceholderFromId(facetValueFilter.and);
                                    qb2.where(
                                        `:${placeholder}::varchar = ANY (string_to_array(si.facetValueIds, ','))`,
                                        { [placeholder]: facetValueFilter.and },
                                    );
                                }
                                if (facetValueFilter.or?.length) {
                                    for (const id of facetValueFilter.or) {
                                        const placeholder = createPlaceholderFromId(id);
                                        qb2.orWhere(
                                            `:${placeholder}::varchar = ANY (string_to_array(si.facetValueIds, ','))`,
                                            { [placeholder]: id },
                                        );
                                    }
                                }
                            }),
                        );
                    }
                }),
            );
        }

        if (collectionId) {
            qb.andWhere(
                ":collectionId::varchar = ANY (string_to_array(si.collectionIds, ','))",
                { collectionId },
            );
        }

        if (collectionSlug) {
            qb.andWhere(
                ":collectionSlug::varchar = ANY (string_to_array(si.collectionSlugs, ','))",
                { collectionSlug },
            );
        }

        qb.andWhere('si.channelId = :channelId', { channelId: ctx.channelId });
        applyLanguageConstraints(qb, ctx.languageCode, ctx.channel.defaultLanguageCode);

        if (input.groupByProduct === true) {
            qb.groupBy('si.productId');
        }

        return qb;
    }
}
