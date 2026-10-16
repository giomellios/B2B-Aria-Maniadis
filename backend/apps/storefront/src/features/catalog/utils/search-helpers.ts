type SearchParams = { [key: string]: string | string[] | undefined };

export interface PriceRange {
  /** Minor units (cents), tax included. */
  min?: number;
  max?: number;
}

export interface SearchInputParams {
  term?: string;
  collectionSlug?: string;
  collectionSlugs?: string[];
  take: number;
  skip: number;
  groupByProduct: boolean;
  sort: { name?: "ASC" | "DESC"; price?: "ASC" | "DESC" };
  facetValueFilters?: Array<{ and: string } | { or: string[] }>;
  inStock?: boolean;
  priceRangeWithTax?: PriceRange;
}

interface BuildSearchInputOptions {
  searchParams: SearchParams;
  collectionSlug?: string;
}

/**
 * Filters in the URL:
 * - `facets=<facetId>:<valueId>` (repeatable): values of one facet are OR-ed, facets are AND-ed.
 *   A bare `<valueId>` (older links) must match on its own.
 * - `category=<collectionSlug>` (repeatable, OR) · `price=<min>-<max>` in cents, either side
 *   optional · `inStock=1` · `q`, `sort`.
 * Listing view (see getListingView): `page`, `perPage`, `more` ("load more"), `grid`.
 */
export interface SearchFilters {
  facetValueIds: string[];
  facetValueFilters: Array<{ and: string } | { or: string[] }>;
  categories: string[];
  price?: PriceRange;
  inStockOnly: boolean;
}

function all(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function encodePriceRange({ min, max }: PriceRange): string {
  return `${min ?? ""}-${max ?? ""}`;
}

export function parsePriceRange(value: string | undefined): PriceRange | undefined {
  const match = value?.match(/^(\d*)-(\d*)$/);
  if (!match || (!match[1] && !match[2])) return undefined;
  const min = match[1] ? Number(match[1]) : undefined;
  const max = match[2] ? Number(match[2]) : undefined;
  if (min != null && max != null && min > max) return { min: max, max: min };
  return { min, max };
}

export function parseSearchFilters(searchParams: SearchParams): SearchFilters {
  const byFacet = new Map<string, string[]>();
  const standalone: string[] = [];
  for (const entry of all(searchParams.facets)) {
    const [facetId, valueId] = entry.includes(":") ? entry.split(":", 2) : [undefined, entry];
    if (!valueId) continue;
    if (facetId) byFacet.set(facetId, [...(byFacet.get(facetId) ?? []), valueId]);
    else standalone.push(valueId);
  }
  const inStockValue = first(searchParams.inStock);

  return {
    facetValueIds: [...[...byFacet.values()].flat(), ...standalone],
    facetValueFilters: [
      ...[...byFacet.values()].map((ids) => ({ or: ids })),
      ...standalone.map((id) => ({ and: id })),
    ],
    categories: all(searchParams.category),
    price: parsePriceRange(first(searchParams.price)),
    inStockOnly: inStockValue === "1" || inStockValue === "true" || inStockValue === "yes",
  };
}

export function buildSearchInput({
  searchParams,
  collectionSlug,
}: BuildSearchInputOptions): SearchInputParams {
  const { take, skip } = getListingView(searchParams);
  const sort = (searchParams.sort as string) || "name-asc";
  const filters = parseSearchFilters(searchParams);

  // Map sort parameter to Vendure SearchResultSortParameter
  const sortMapping: Record<string, { name?: "ASC" | "DESC"; price?: "ASC" | "DESC" }> = {
    "name-asc": { name: "ASC" },
    "name-desc": { name: "DESC" },
    "price-asc": { price: "ASC" },
    "price-desc": { price: "DESC" },
  };

  return {
    ...buildBaseSearchInput({ searchParams, collectionSlug }),
    take,
    skip,
    groupByProduct: true,
    sort: sortMapping[sort] || sortMapping["name-asc"],
    ...(!collectionSlug &&
      filters.categories.length > 0 && { collectionSlugs: filters.categories }),
    ...(filters.facetValueFilters.length > 0 && { facetValueFilters: filters.facetValueFilters }),
    ...(filters.price && { priceRangeWithTax: filters.price }),
  };
}

/**
 * The part of the search that defines "what is being browsed" (term, stock, collection page) —
 * without the facet/category/price selections. Filter options are computed from this, so the
 * choices stay visible and selectable while filters are applied.
 */
export function buildBaseSearchInput({
  searchParams,
  collectionSlug,
}: BuildSearchInputOptions): Pick<SearchInputParams, "term" | "collectionSlug" | "inStock"> {
  const searchTerm = first(searchParams.q)?.trim();
  return {
    ...(searchTerm && { term: searchTerm }),
    ...(collectionSlug && { collectionSlug }),
    ...(parseSearchFilters(searchParams).inStockOnly && { inStock: true }),
  };
}

/** URLSearchParams (client) → the plain object shape Next passes to pages. */
export function searchParamsToObject(params: URLSearchParams): SearchParams {
  const result: SearchParams = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    result[key] = values.length > 1 ? values : values[0];
  }
  return result;
}

export const PER_PAGE_OPTIONS = [12, 24, 48] as const;
export const GRID_OPTIONS = [3, 4] as const;

export interface ListingView {
  /** Page the listing starts at (1-based). */
  page: number;
  perPage: number;
  /** Extra pages appended by "load more" after `page`. */
  more: number;
  /** Products per row on desktop. */
  grid: (typeof GRID_OPTIONS)[number];
  take: number;
  skip: number;
  /** Last page currently shown (page + more). */
  lastPage: number;
}

/** Paging and layout of a product listing, read from the URL (invalid values fall back). */
export function getListingView(searchParams: SearchParams): ListingView {
  const page = Math.max(1, Math.floor(Number(first(searchParams.page))) || 1);
  const perPageValue = Number(first(searchParams.perPage));
  const perPage = (PER_PAGE_OPTIONS as readonly number[]).includes(perPageValue)
    ? perPageValue
    : PER_PAGE_OPTIONS[0];
  const more = Math.min(20, Math.max(0, Math.floor(Number(first(searchParams.more))) || 0));
  const grid = first(searchParams.grid) === "4" ? 4 : 3;
  return {
    page,
    perPage,
    more,
    grid,
    take: perPage * (more + 1),
    skip: (page - 1) * perPage,
    lastPage: page + more,
  };
}
