import { ProductCarousel } from "@/features/catalog";
import { getLocale, getT } from "@/lib/i18n/server";
import { getFeaturedProducts } from "@/features/home/services/home.service";

export async function FeaturedProducts() {
  const [{ products, fallbackImagesBySlug }, t] = await Promise.all([
    getFeaturedProducts(await getLocale()),
    getT(),
  ]);

  if (!products.length) {
    return null;
  }

  return (
    <ProductCarousel
      eyebrow={t.home.featured.eyebrow}
      title={t.home.featured.title}
      products={products}
      fallbackImagesBySlug={fallbackImagesBySlug}
    />
  );
}
