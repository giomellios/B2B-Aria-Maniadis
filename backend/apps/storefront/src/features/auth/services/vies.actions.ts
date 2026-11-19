"use server";

import { isViesCountry, normalizeVatNumber, type ViesLookupResult } from "@/features/auth/vies";

const VIES_URL = "https://ec.europa.eu/taxation_customs/vies/rest-api/ms";
const TIMEOUT_MS = 8_000;

/** What VIES returns for a missing value. */
const EMPTY = "---";

/** `userError` values that mean "VIES couldn't check", not "this number doesn't exist". */
const UNAVAILABLE_ERRORS = new Set([
  "MS_UNAVAILABLE",
  "SERVICE_UNAVAILABLE",
  "TIMEOUT",
  "MS_MAX_CONCURRENT_REQ",
  "GLOBAL_MAX_CONCURRENT_REQ",
]);

interface ViesResponse {
  isValid?: boolean;
  userError?: string;
  name?: string;
  address?: string;
}

/**
 * Looks a VAT number up in VIES, for prefilling the registration form. Runs on the server
 * because VIES does not allow browser (CORS) requests. Never throws: when VIES is down or slow
 * the customer simply fills in the fields by hand.
 */
export async function lookupVatNumber(
  country: string,
  vatNumber: string
): Promise<ViesLookupResult> {
  if (!isViesCountry(country)) {
    return { status: "invalid" };
  }
  const number = normalizeVatNumber(vatNumber, country);
  // VAT numbers are 2–12 characters; anything else is a typo, so don't bother VIES with it.
  if (!/^[0-9A-Z+*]{2,12}$/.test(number)) {
    return { status: "invalid" };
  }

  try {
    const response = await fetch(`${VIES_URL}/${country}/vat/${encodeURIComponent(number)}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      return { status: "unavailable" };
    }
    const data = (await response.json()) as ViesResponse;
    if (data.isValid !== true) {
      // isValid is also false when a member state's service is down (userError MS_UNAVAILABLE…).
      return {
        status:
          data.userError && UNAVAILABLE_ERRORS.has(data.userError) ? "unavailable" : "invalid",
      };
    }
    return {
      status: "valid",
      name: clean(data.name),
      address: formatAddress(data.address),
    };
  } catch {
    return { status: "unavailable" };
  }
}

function clean(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  return trimmed === EMPTY ? "" : trimmed;
}

/** VIES separates address lines with newlines or runs of spaces: "ΑΙΟΛΟΥ 86   10559 - ΑΘΗΝΑ". */
function formatAddress(value: string | undefined): string {
  return clean(value)
    .split(/\n|\s{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}
