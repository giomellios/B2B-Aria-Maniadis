import "server-only";
import { cacheLife } from "next/cache";
import { query } from "@/lib/api/client";
import { SearchProductsQuery } from "@/features/catalog/server";

export async function getFeaturedProducts() {
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
