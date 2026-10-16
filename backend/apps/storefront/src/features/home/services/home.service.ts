import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/lib/api/client";
import { readFragment, type FragmentOf } from "@/lib/api/graphql";
import type { Locale } from "@/lib/i18n/config";

import { ProductCardFragment, SearchProductsQuery } from "@/features/catalog/server";
import { ProductImagesQuery } from "@/features/home/services/queries";

const FEATURED_COUNT = 12;
/** Upper bound for the catalogue scan (products are listed 100 per request). */
const MAX_SCANNED_PRODUCTS = 1000;
const PAGE_SIZE = 100;

type ProductCard = FragmentOf<typeof ProductCardFragment>;

export interface FeaturedProducts {
  products: ProductCard[];
  /** Image for products whose picture is not in the search index (e.g. only on a variant). */
  fallbackImagesBySlug: Record<string, string>;
}

/** Newest products first, slug → first image found (product, gallery, then variants). */
async function getProductImages(languageCode: Locale): Promise<Map<string, string>> {
  const images = new Map<string, string>();
  for (let skip = 0; skip < MAX_SCANNED_PRODUCTS; skip += PAGE_SIZE) {
    const { data } = await query(
      ProductImagesQuery,
      { options: { take: PAGE_SIZE, skip, sort: { createdAt: "DESC" } } },
      { languageCode }
    );
    for (const product of data.products.items) {
      const preview =
        product.featuredAsset?.preview ||
        product.assets.find((asset) => asset.preview)?.preview ||
        product.variants.find((variant) => variant.featuredAsset?.preview)?.featuredAsset?.preview;
      if (preview) {
        images.set(product.slug, preview);
      }
    }
    if (skip + PAGE_SIZE >= data.products.totalItems) {
      break;
    }
  }
  return images;
}

/**
 * Homepage "featured" products: products with a picture first (newest first), then products
 * without one, up to FEATURED_COUNT.
 */
export async function getFeaturedProducts(languageCode: Locale): Promise<FeaturedProducts> {
  "use cache";
  cacheLife("hours");
  cacheTag("featured-products");

  try {
    const [images, result] = await Promise.all([
      getProductImages(languageCode),
      query(
        SearchProductsQuery,
        { input: { take: MAX_SCANNED_PRODUCTS, skip: 0, groupByProduct: true } },
        { languageCode }
      ),
    ]);

    // Card data (price, stock, SKU) comes from the search index. Products with a picture come
    // first (newest first); the remaining places are filled with products without one.
    const bySlug = new Map(
      result.data.search.items.map((item) => [readFragment(ProductCardFragment, item).slug, item])
    );
    const withImage = [...images.keys()]
      .map((slug) => bySlug.get(slug))
      .filter((item): item is ProductCard => item != null);
    const withoutImage = result.data.search.items.filter(
      (item) => !images.has(readFragment(ProductCardFragment, item).slug)
    );
    const products = [...withImage, ...withoutImage].slice(0, FEATURED_COUNT);

    return {
      products,
      fallbackImagesBySlug: Object.fromEntries(
        products.flatMap((item) => {
          const slug = readFragment(ProductCardFragment, item).slug;
          const image = images.get(slug);
          return image ? [[slug, image]] : [];
        })
      ),
    };
  } catch (error) {
    if (error instanceof TypeError && error.message === "fetch failed") {
      console.warn("Vendure API not reachable — returning empty product list");
      return { products: [], fallbackImagesBySlug: {} };
    }
    throw error;
  }
}
