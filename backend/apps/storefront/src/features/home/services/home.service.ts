import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { ForbiddenError, query } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n/config";
import { DestinationCountsQuery } from "@/features/home/services/queries";

const DESTINATION_FACET_CODE = "destination";

export interface Destination {
  /** Product count on the store for this destination. */
  count: number;
  /** Catalogue filter value (`facetId:valueId`) for /search?facets=… */
  filter: string;
}

/**
 * Destination facet values by code (e.g. "mykonos"), with their product counts. Empty for
 * visitors who are not signed in (`token`: the customer's auth token).
 */
export async function getDestinations(
  languageCode: Locale,
  token: string | undefined
): Promise<Record<string, Destination>> {
  "use cache";
  cacheLife("hours");
  cacheTag("destinations");

  if (!token) return {};
  try {
    const { data } = await query(DestinationCountsQuery, {}, { languageCode, token });
    return Object.fromEntries(
      data.search.facetValues
        .filter(({ facetValue }) => facetValue.facet.code === DESTINATION_FACET_CODE)
        .map(({ count, facetValue }) => [
          facetValue.code,
          { count, filter: `${facetValue.facet.id}:${facetValue.id}` },
        ])
    );
  } catch (error) {
    if (error instanceof ForbiddenError) return {};
    if (error instanceof TypeError && error.message === "fetch failed") {
      console.warn("Vendure API not reachable — island sheet without live counts");
      return {};
    }
    throw error;
  }
}
