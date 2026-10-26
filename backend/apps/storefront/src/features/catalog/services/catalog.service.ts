import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n/config";

import { readFragment } from "@/lib/api/graphql";
import {
  GetCollectionProductsQuery,
  GetProductDetailQuery,
  SearchFilterOptionsQuery,
  SearchProductsQuery,
} from "@/features/catalog/services/queries";
import { ProductCardFragment } from "@/features/catalog/services/fragments";
import { getProductCardImageFallbacks } from "@/features/catalog/services/product-card-images.service";
import { buildBaseSearchInput, buildSearchInput } from "@/features/catalog/utils/search-helpers";

type SearchParams = { [key: string]: string | string[] | undefined };

// The Shop API only answers signed-in customers, so every loader takes the customer's auth token
// (getAuthToken(); "use cache" functions cannot read cookies). Being an argument, it is part of the
// cache key: cached results are never shared between sessions.

export async function getCollectionProducts(
  slug: string,
  searchParams: SearchParams,
  languageCode: Locale,
  token: string | undefined
) {
  "use cache";
  cacheLife("hours");
  cacheTag(`collection-${slug}`);

  return query(
    SearchProductsQuery,
    {
      input: buildSearchInput({
        searchParams,
        collectionSlug: slug,
      }),
    },
    { languageCode, token }
  );
}

export async function getCollectionMetadata(
  slug: string,
  languageCode: Locale,
  token: string | undefined
) {
  "use cache";
  cacheLife("hours");
  cacheTag(`collection-meta-${slug}`);

  return query(
    GetCollectionProductsQuery,
    {
      slug,
      input: { take: 0, collectionSlug: slug, groupByProduct: true },
    },
    { languageCode, token }
  );
}

/** Collection name/description for the collection header (uncached). */
export async function getCollectionSummary(slug: string) {
  const result = await query(
    GetCollectionProductsQuery,
    { slug, input: { take: 0, collectionSlug: slug, groupByProduct: true } },
    { useAuthToken: true }
  );
  return result.data.collection;
}

export async function getProductData(
  slug: string,
  languageCode: Locale,
  token: string | undefined
) {
  "use cache";
  cacheLife("hours");
  cacheTag(`product-${slug}`);

  return await query(GetProductDetailQuery, { slug }, { languageCode, token });
}

export async function getRelatedProducts(
  collectionSlug: string,
  currentProductId: string,
  languageCode: Locale,
  token: string | undefined
) {
  "use cache";
  cacheLife("hours");
  cacheTag(`related-products-${collectionSlug}`);

  try {
    const result = await query(
      GetCollectionProductsQuery,
      {
        slug: collectionSlug,
        input: {
          collectionSlug: collectionSlug,
          take: 13, // Fetch extra to account for filtering out current product
          skip: 0,
          groupByProduct: true,
        },
      },
      { languageCode, token }
    );

    const products = result.data.search.items
      .filter((item) => {
        const product = readFragment(ProductCardFragment, item);
        return product.productId !== currentProductId;
      })
      .slice(0, 12);

    const missingImageSlugs = products
      .map((item) => readFragment(ProductCardFragment, item))
      .filter((product) => {
        return !product.productAsset?.preview && !product.productVariantAsset?.preview;
      })
      .map((product) => product.slug)
      .filter(Boolean);

    const fallbackImagesBySlugMap = await getProductCardImageFallbacks(
      missingImageSlugs,
      token,
      languageCode
    );

    return {
      products,
      fallbackImagesBySlug: Object.fromEntries(fallbackImagesBySlugMap),
    };
  } catch (error) {
    if (error instanceof TypeError && error.message === "fetch failed") {
      console.warn("Vendure API not reachable — returning empty related products");
      return {
        products: [],
        fallbackImagesBySlug: {},
      };
    }
    throw error;
  }
}

/** Search results for the /search page, revalidated every minute. */
export async function searchProducts(
  searchParams: SearchParams,
  languageCode: Locale,
  token: string | undefined
) {
  "use cache";
  cacheLife("minutes");
  cacheTag("search");

  return query(
    SearchProductsQuery,
    { input: buildSearchInput({ searchParams }) },
    { languageCode, token }
  );
}

/**
 * Options for the filter sidebar (facet values, categories, price bounds) for what is being
 * browsed — a search term and/or a collection — independent of the selected filters.
 */
export async function getSearchFilterOptions(
  searchParams: SearchParams,
  languageCode: Locale,
  token: string | undefined,
  collectionSlug?: string
) {
  "use cache";
  cacheLife("minutes");
  cacheTag(collectionSlug ? `collection-${collectionSlug}` : "search");

  const base = buildBaseSearchInput({ searchParams, collectionSlug });
  const result = await query(
    SearchFilterOptionsQuery,
    {
      input: { ...base, take: 0, groupByProduct: true },
      cheapestInput: { ...base, take: 1, groupByProduct: false, sort: { price: "ASC" } },
      priciestInput: { ...base, take: 1, groupByProduct: false, sort: { price: "DESC" } },
    },
    { languageCode, token }
  );
  return result.data;
}
