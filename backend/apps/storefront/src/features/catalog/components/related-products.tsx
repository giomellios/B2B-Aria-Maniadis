import { ProductCarousel } from "@/features/catalog/components/product-carousel";
import { getLocale, getT } from "@/lib/i18n/server";
import { getRelatedProducts } from "@/features/catalog/services/catalog.service";
import { getAuthToken } from "@/lib/api/auth-token";

interface RelatedProductsProps {
  collectionSlug: string;
  currentProductId: string;
}

export async function RelatedProducts({ collectionSlug, currentProductId }: RelatedProductsProps) {
  const t = await getT();
  const { products, fallbackImagesBySlug } = await getRelatedProducts(
    collectionSlug,
    currentProductId,
    await getLocale(),
    await getAuthToken()
  );

  if (products.length === 0) {
    return null;
  }

  return (
    <ProductCarousel
      title={t.catalog.youMayAlsoLike}
      products={products}
      fallbackImagesBySlug={fallbackImagesBySlug}
    />
  );
}
