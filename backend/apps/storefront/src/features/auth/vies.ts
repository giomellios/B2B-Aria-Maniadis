// EU VAT numbers are checked against VIES (the EU's VAT Information Exchange System).
// Shared by the registration form (client) and the lookup action (server).

/**
 * VIES member-state codes. VIES uses "EL" for Greece (not the ISO "GR"); every other code is the
 * ISO 3166 country code, which is what `isoRegion` maps to for showing the country name.
 */
export const VIES_COUNTRIES = [
  "EL",
  "AT",
  "BE",
  "BG",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "HR",
  "HU",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
] as const;

export type ViesCountry = (typeof VIES_COUNTRIES)[number];

export const DEFAULT_VIES_COUNTRY: ViesCountry = "EL";

export function isViesCountry(value: unknown): value is ViesCountry {
  return typeof value === "string" && (VIES_COUNTRIES as readonly string[]).includes(value);
}

/** The ISO region code for `Intl.DisplayNames` (EL → GR). */
export function isoRegion(country: ViesCountry): string {
  return country === "EL" ? "GR" : country;
}

/**
 * Strips spaces, dots and dashes, and a leading country prefix the customer may have typed
 * ("EL 094 014 201" → "094014201").
 */
export function normalizeVatNumber(vatNumber: string, country: ViesCountry): string {
  const compact = vatNumber.replace(/[\s.\-]/g, "").toUpperCase();
  const prefixes = country === "EL" ? ["EL", "GR"] : [country];
  const prefix = prefixes.find((p) => compact.startsWith(p));
  return prefix ? compact.slice(prefix.length) : compact;
}

export type ViesLookupResult =
  | { status: "valid"; name: string; address: string }
  | { status: "invalid" }
  | { status: "unavailable" };
