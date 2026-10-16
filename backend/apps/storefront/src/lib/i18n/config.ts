export const LOCALES = ["el", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "el";

/** Cookie that remembers the visitor's language choice (read by the proxy for un-prefixed URLs). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Request header the proxy sets so server code outside the route tree (actions, API client) knows the language. */
export const LOCALE_HEADER = "x-locale";

/** BCP 47 tags used for Intl formatting and <html lang>, OpenGraph etc. */
export const INTL_LOCALE: Record<Locale, string> = {
  el: "el-GR",
  en: "en-GB",
};

export const OG_LOCALE: Record<Locale, string> = {
  el: "el_GR",
  en: "en_GB",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Prefix an internal path with a locale. Leaves external URLs, /api and already-prefixed paths alone. */
export function localizePath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/api")) return path;
  const [, first] = path.split("/");
  if (isLocale(first)) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Remove the locale prefix from a pathname: "/el/product/x" → "/product/x". */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  if (!isLocale(first)) return pathname;
  return `/${rest.join("/")}`;
}
