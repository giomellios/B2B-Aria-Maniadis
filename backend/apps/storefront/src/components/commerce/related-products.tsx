import { ProductCarousel } from "@/components/commerce/product-carousel";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/lib/vendure/api";
import { GetCollectionProductsQuery } from "@/lib/vendure/queries";
import { readFragment } from "@/graphql";
import { ProductCardFragment } from "@/lib/vendure/fragments";
import { getProductCardImageFallbacks } from "@/lib/vendure/product-card-images";

interface RelatedProductsProps {
  collectionSlug: string;
  currentProductId: string;
}

async function getRelatedProducts(collectionSlug: string, currentProductId: string) {
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

export async function RelatedProducts({ collectionSlug, currentProductId }: RelatedProductsProps) {
  const { products, fallbackImagesBySlug } = await getRelatedProducts(
    collectionSlug,
    currentProductId
  );

  if (products.length === 0) {
    return null;
  }

  return (
    <ProductCarousel
      title="Related Products"
      products={products}
      fallbackImagesBySlug={fallbackImagesBySlug}
    />
  );
}
