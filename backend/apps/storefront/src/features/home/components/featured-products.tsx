import { ProductCarousel } from "@/features/catalog";
import { getLocale, getT } from "@/lib/i18n/server";
import { getFeaturedProducts } from "@/features/home/services/home.service";

export async function FeaturedProducts() {
  const [products, t] = await Promise.all([getFeaturedProducts(await getLocale()), getT()]);

  return (
    <ProductCarousel
      eyebrow={t.home.featured.eyebrow}
      title={t.home.featured.title}
      products={products}
    />
  );
}
