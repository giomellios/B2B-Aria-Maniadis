import type { Metadata } from "next";

import { SITE_URL } from "@/lib/config/env";
import { DEFAULT_LOCALE, LOCALES, localizePath, type Locale } from "@/lib/i18n/config";

export { SITE_NAME, SITE_URL } from "@/lib/config/env";

/**
 * Truncate text to a maximum length, preserving word boundaries.
 * Strips HTML tags and is ideal for meta descriptions (recommended 150-160 chars).
 */
export function truncateDescription(text: string | null | undefined, maxLength = 155): string {
  if (!text) return "";

  // Strip HTML tags if present
  const cleanText = text.replace(/<[^>]*>/g, "").trim();

  if (cleanText.length <= maxLength) return cleanText;

  // Find the last space before maxLength to avoid cutting words
  const truncated = cleanText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  return lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) + "..." : truncated + "...";
}

/**
 * Build a canonical URL for a given path, in the given locale ("/cart" → "https://…/el/cart").
 */
export function buildCanonicalUrl(path: string, locale: Locale): string {
  const baseUrl = SITE_URL.replace(/\/$/, ""); // Remove trailing slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${localizePath(cleanPath, locale)}`;
}

/**
 * Canonical URL plus hreflang alternates for every locale, for `metadata.alternates`.
 */
export function buildAlternates(path: string, locale: Locale): Metadata["alternates"] {
  return {
    canonical: buildCanonicalUrl(path, locale),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, buildCanonicalUrl(path, l)])),
      "x-default": buildCanonicalUrl(path, DEFAULT_LOCALE),
    },
  };
}

/**
 * Build Open Graph image array from an image URL.
 */
export function buildOgImages(
  imageUrl: string | null | undefined,
  alt = "Product image"
): NonNullable<Metadata["openGraph"]>["images"] {
  if (!imageUrl) return undefined;

  return [
    {
      url: imageUrl,
      alt,
    },
  ];
}

/**
 * Create noindex/nofollow robots config for protected pages.
 */
export function noIndexRobots(): Metadata["robots"] {
  return {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  };
}
