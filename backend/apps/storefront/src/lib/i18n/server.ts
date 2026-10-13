import "server-only";
import { headers } from "next/headers";
import { locale as rootLocale } from "next/root-params";
import { DEFAULT_LOCALE, LOCALE_HEADER, isLocale, type Locale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";

/**
 * Locale of the current route, for Server Components, layouts and generateMetadata.
 * Uses the [locale] root param, so it keeps pages statically renderable.
 */
export async function getLocale(): Promise<Locale> {
  const value = await rootLocale();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Locale of the current request, for Server Actions and the Vendure API client
 * (root params are not available there). Set by src/proxy.ts.
 */
export async function getRequestLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Dictionary for the current route (Server Components). */
export async function getT() {
  return dictionaries[await getLocale()];
}

/** Dictionary for the current request (Server Actions). */
export async function getRequestT() {
  return dictionaries[await getRequestLocale()];
}
