import { DEFAULT_LOCALE, INTL_LOCALE, type Locale } from "@/lib/i18n/config";

/**
 * Format a price value
 * @param price Price in cents (smallest currency unit)
 */
export function formatPrice(
  price: number,
  currencyCode = "EUR",
  locale: Locale = DEFAULT_LOCALE
): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency: currencyCode,
  }).format(price / 100);
}

type DateFormat = "short" | "long";

/**
 * Format a date string in the given locale
 * @param dateString ISO date string
 * @param format 'short' (15 Jan 2024 / 15 Ιαν 2024) or 'long' (15 January 2024 / 15 Ιανουαρίου 2024)
 */
export function formatDate(
  dateString: string,
  format: DateFormat = "short",
  locale: Locale = DEFAULT_LOCALE
): string {
  const options: Intl.DateTimeFormatOptions =
    format === "long"
      ? { year: "numeric", month: "long", day: "numeric" }
      : { year: "numeric", month: "short", day: "numeric" };

  return new Date(dateString).toLocaleDateString(INTL_LOCALE[locale], options);
}
