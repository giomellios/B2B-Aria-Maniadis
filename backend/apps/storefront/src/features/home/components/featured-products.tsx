import { ProductCarousel } from "@/features/catalog";
import { getFeaturedProducts } from "@/features/home/services/home.service";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return <ProductCarousel title="Our Collection" products={products} />;
}
