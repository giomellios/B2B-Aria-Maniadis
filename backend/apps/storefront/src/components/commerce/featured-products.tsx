import { ProductCarousel } from "@/components/commerce/product-carousel";
import { cacheLife } from "next/cache";
import { query } from "@/lib/vendure/api";
import { SearchProductsQuery } from "@/lib/vendure/queries";

async function getAllProducts() {
  "use cache";
  cacheLife("days");

  try {
    const result = await query(SearchProductsQuery, {
      input: {
        take: 12,
        skip: 0,
        groupByProduct: true,
      },
    });

    return result.data.search.items;
  } catch (error) {
    if (error instanceof TypeError && error.message === "fetch failed") {
      console.warn("Vendure API not reachable — returning empty product list");
      return [];
    }
    throw error;
  }
}

export async function FeaturedProducts() {
  const products = await getAllProducts();

  return <ProductCarousel title="Our Collection" products={products} />;
}
