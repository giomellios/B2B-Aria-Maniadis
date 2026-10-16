import type { ResultOf } from "@/lib/api/graphql";
import type { SearchFilterOptionsQuery } from "@/features/catalog/services/queries";
import type { PriceRange } from "@/features/catalog/utils/search-helpers";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";

export type FilterOptionsData = ResultOf<typeof SearchFilterOptionsQuery>;

export interface FacetOption {
  id: string;
  code: string;
  name: string;
  values: Array<{ id: string; name: string; count: number }>;
}

export interface FilterOptions {
  facets: FacetOption[];
  categories: Array<{ slug: string; name: string; count: number }>;
  /** Cheapest and priciest price (cents), rounded outward to whole units; null if no range. */
  priceBounds: { min: number; max: number } | null;
  currencyCode: string;
}

/** Facets the CSV import fills automatically come first, in this order; others follow by name. */
const FACET_ORDER = ["destination", "color", "characteristic"];

export function toFilterOptions(data: FilterOptionsData, locale: Locale): FilterOptions {
  const facets = new Map<string, FacetOption>();
  for (const { count, facetValue } of data.search.facetValues) {
    const { facet } = facetValue;
    const option = facets.get(facet.id) ?? {
      id: facet.id,
      code: facet.code,
      name: facet.name,
      values: [],
    };
    option.values.push({ id: facetValue.id, name: facetValue.name, count });
    facets.set(facet.id, option);
  }
  const rank = (code: string) => {
    const index = FACET_ORDER.indexOf(code);
    return index === -1 ? FACET_ORDER.length : index;
  };
  const collator = new Intl.Collator(INTL_LOCALE[locale]);
  const sortedFacets = [...facets.values()]
    .map((facet) => ({
      ...facet,
      values: [...facet.values].sort((a, b) => collator.compare(a.name, b.name)),
    }))
    .sort((a, b) => rank(a.code) - rank(b.code) || collator.compare(a.name, b.name));

  const cheapest = data.cheapest.items[0];
  const priciest = data.priciest.items[0];
  const priceOf = (item: typeof cheapest | typeof priciest | undefined) =>
    item?.priceWithTax.__typename === "SinglePrice" ? item.priceWithTax.value : undefined;
  const min = priceOf(cheapest);
  const max = priceOf(priciest);
  const priceBounds =
    min != null && max != null && max > min
      ? { min: Math.floor(min / 100) * 100, max: Math.ceil(max / 100) * 100 }
      : null;

  return {
    facets: sortedFacets,
    categories: data.search.collections
      .map(({ count, collection }) => ({ slug: collection.slug, name: collection.name, count }))
      .sort((a, b) => collator.compare(a.name, b.name)),
    priceBounds,
    currencyCode: cheapest?.currencyCode ?? "EUR",
  };
}

export function formatPrice(cents: number, currencyCode: string, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** "€2 – €4", "Up to €4", "From €2". */
export function formatPriceRange(
  { min, max }: PriceRange,
  currencyCode: string,
  locale: Locale,
  labels: { upTo: string; from: string }
): string {
  if (min != null && max != null) {
    return `${formatPrice(min, currencyCode, locale)} – ${formatPrice(max, currencyCode, locale)}`;
  }
  if (max != null) return labels.upTo.replace("{price}", formatPrice(max, currencyCode, locale));
  return labels.from.replace("{price}", formatPrice(min ?? 0, currencyCode, locale));
}
