import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n/config";

import {
  GetActiveChannelQuery,
  GetAvailableCountriesQuery,
  GetTopCollectionsQuery,
} from "@/lib/queries/shared-queries";

/**
 * Check if an error is a connection error (API server not reachable)
 */
function isConnectionError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === "fetch failed") return true;
  if (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ECONNREFUSED"
  )
    return true;
  if (error instanceof AggregateError) return error.errors.some((e) => isConnectionError(e));
  if (error instanceof Error && "cause" in error) return isConnectionError(error.cause);
  return false;
}

/**
 * Get the active channel with caching enabled.
 * Channel configuration rarely changes, so we cache it for 1 hour.
 */
export async function getActiveChannelCached(languageCode: Locale) {
  "use cache";
  cacheLife("hours");

  try {
    const result = await query(GetActiveChannelQuery, undefined, { languageCode });
    return result.data.activeChannel;
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("Vendure API not reachable — returning null for active channel");
      return null;
    }
    throw error;
  }
}

/**
 * Get available countries with caching enabled.
 * Countries list never changes, so we cache it with max duration.
 */
export async function getAvailableCountriesCached(languageCode: Locale) {
  "use cache";
  cacheLife("max");
  cacheTag("countries");

  try {
    const result = await query(GetAvailableCountriesQuery, undefined, { languageCode });
    return result.data.availableCountries || [];
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("Vendure API not reachable — returning empty countries list");
      return [];
    }
    throw error;
  }
}

/**
 * Get top-level collections with caching enabled.
 * Collections rarely change, so we cache them for 1 day.
 */
export async function getTopCollections(languageCode: Locale) {
  try {
    const result = await query(GetTopCollectionsQuery, undefined, {
      revalidateSeconds: 60 * 60 * 24,
      languageCode,
    });
    return result.data.collections.items;
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("Vendure API not reachable — returning empty collections");
      return [];
    }
    throw error;
  }
}
