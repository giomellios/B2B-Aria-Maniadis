import type { Locale } from "@/lib/i18n/config";
import { el } from "@/lib/i18n/dictionaries/el";
import { en } from "@/lib/i18n/dictionaries/en";

export type Dictionary = typeof en;

// Both dictionaries are small, so they are bundled directly (no async loading needed).
export const dictionaries: Record<Locale, Dictionary> = { el, en };

/** Fill `{name}` placeholders: format("Hi {name}", { name: "Ann" }) → "Hi Ann". */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  );
}
