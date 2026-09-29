import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/lib/api/client";
import { readFragment } from "@/lib/api/graphql";
import {
  GetCollectionProductsQuery,
  GetProductDetailQuery,
  SearchProductsQuery,
} from "@/features/catalog/services/queries";
import { ProductCardFragment } from "@/features/catalog/services/fragments";
import { getProductCardImageFallbacks } from "@/features/catalog/services/product-card-images.service";
import { buildSearchInput } from "@/features/catalog/utils/search-helpers";

export async function getCollectionProducts(
  slug: string,
  searchParams: { [key: string]: string | string[] | undefined }
) {
  "use cache";
  cacheLife("hours");
  cacheTag(`collection-${slug}`);

  return query(SearchProductsQuery, {
    input: buildSearchInput({
      searchParams,
      collectionSlug: slug,
    }),
  });
}

export async function getCollectionMetadata(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`collection-meta-${slug}`);

  return query(GetCollectionProductsQuery, {
    slug,
    input: { take: 0, collectionSlug: slug, groupByProduct: true },
  });
}

/** Collection name/description for the collection header (uncached). */
export async function getCollectionSummary(slug: string) {
  const result = await query(GetCollectionProductsQuery, {
    slug,
    input: { take: 0, collectionSlug: slug, groupByProduct: true },
  });
  return result.data.collection;
}

export async function getProductData(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`product-${slug}`);

  return await query(GetProductDetailQuery, { slug });
}

export async function getRelatedProducts(collectionSlug: string, currentProductId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`related-products-${collectionSlug}`);

  try {
    const result = await query(GetCollectionProductsQuery, {
      slug: collectionSlug,
      input: {
        collectionSlug: collectionSlug,
        take: 13, // Fetch extra to account for filtering out current product
        skip: 0,
        groupByProduct: true,
      },
    });

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

    const fallbackImagesBySlugMap = await getProductCardImageFallbacks(missingImageSlugs);

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

/**
 * Search results for the /search page. Search is anonymous (no auth token), so results are
 * shared across visitors and revalidated every minute.
 */
export async function searchProducts(searchParams: { page?: string; q?: string }) {
  "use cache";
  cacheLife("minutes");
  cacheTag("search");

  return query(SearchProductsQuery, {
    input: buildSearchInput({ searchParams }),
  });
}
