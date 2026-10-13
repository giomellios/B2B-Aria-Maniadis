import "server-only";
import { cacheLife } from "next/cache";
import { query } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n/config";

import { SearchProductsQuery } from "@/features/catalog/server";

export async function getFeaturedProducts(languageCode: Locale) {
  "use cache";
  cacheLife("days");

  try {
    const result = await query(
      SearchProductsQuery,
      {
        input: {
          take: 12,
          skip: 0,
          groupByProduct: true,
        },
      },
      { languageCode }
    );

    return result.data.search.items;
  } catch (error) {
    if (error instanceof TypeError && error.message === "fetch failed") {
      console.warn("Vendure API not reachable — returning empty product list");
      return [];
    }
    throw error;
  }
}
