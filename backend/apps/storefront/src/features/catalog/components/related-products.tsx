import { ProductCarousel } from "@/features/catalog/components/product-carousel";
import { getRelatedProducts } from "@/features/catalog/services/catalog.service";

interface RelatedProductsProps {
  collectionSlug: string;
  currentProductId: string;
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
