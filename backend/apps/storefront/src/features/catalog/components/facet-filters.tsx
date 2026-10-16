"use client";

import { use, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Label,
} from "@/design-system";
import { Faders, Spinner, X } from "@/design-system/icons";
import { PriceSlider } from "@/features/catalog/components/price-slider";
import { useFilterNavigation } from "@/features/catalog/hooks/use-filter-navigation";
import {
  formatPrice,
  formatPriceRange,
  toFilterOptions,
  type FilterOptions,
  type FilterOptionsData,
} from "@/features/catalog/utils/filter-options";
import {
  encodePriceRange,
  parseSearchFilters,
  searchParamsToObject,
  type SearchFilters,
} from "@/features/catalog/utils/search-helpers";
import { format } from "@/lib/i18n/dictionaries";
import { useLocale, useT } from "@/lib/i18n/provider";

interface FacetFiltersProps {
  filterOptionsPromise: Promise<FilterOptionsData>;
  /** Off on collection pages, where the category is already fixed. */
  showCategories?: boolean;
}

/** Values listed before "show more". */
const VISIBLE_VALUES = 6;
/** Sections open by default (sections with a selection are always open). */
const OPEN_SECTIONS = 3;

/**
 * Filter sidebar: "You have selected" + collapsible sections with checkbox lists and a price
 * slider. On mobile the same panel opens in a full-height drawer.
 */
export function FacetFilters({ filterOptionsPromise, showCategories = true }: FacetFiltersProps) {
  const data = use(filterOptionsPromise);
  const locale = useLocale();
  const { catalog: t, a11y } = useT();
  const options = useMemo(() => toFilterOptions(data, locale), [data, locale]);
  const navigation = useFilterNavigation();
  const filters = parseSearchFilters(searchParamsToObject(navigation.searchParams));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeCount =
    filters.facetValueIds.length +
    filters.categories.length +
    (filters.price ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  const panel = (
    <FilterPanel
      options={options}
      filters={filters}
      showCategories={showCategories}
      navigation={navigation}
    />
  );

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-center gap-2 uppercase tracking-[0.12em] text-xs font-semibold lg:hidden"
        onClick={() => setDrawerOpen(true)}
      >
        <Faders className="size-4" />
        {t.filtersButton(activeCount)}
      </Button>
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-0 left-0 flex h-dvh max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 sm:max-w-md data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <DialogTitle className="text-sm font-semibold uppercase tracking-[0.14em]">
              {t.filter}
            </DialogTitle>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label={a11y.close}
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{panel}</div>
          <div className="grid grid-cols-2 gap-3 border-t border-border px-5 py-4">
            <Button
              variant="outline"
              onClick={navigation.clearFilters}
              disabled={activeCount === 0}
              className="uppercase tracking-[0.12em] text-xs"
            >
              {t.clearAll}
            </Button>
            <Button
              onClick={() => setDrawerOpen(false)}
              className="uppercase tracking-[0.12em] text-xs"
            >
              {navigation.isPending && <Spinner className="animate-spin" />}
              {t.applyPrice}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="hidden lg:block">{panel}</div>
    </>
  );
}

function FilterPanel({
  options,
  filters,
  showCategories,
  navigation,
}: {
  options: FilterOptions;
  filters: SearchFilters;
  showCategories: boolean;
  navigation: ReturnType<typeof useFilterNavigation>;
}) {
  const locale = useLocale();
  const t = useT().catalog;
  const { toggle, set, isPending } = navigation;
  const formatCents = (cents: number) => formatPrice(cents, options.currencyCode, locale);

  type Section = { id: string; title: string; active: boolean; content: React.ReactNode };
  const sections: Section[] = [];

  if (showCategories && options.categories.length > 0) {
    sections.push({
      id: "category",
      title: t.categories,
      active: filters.categories.length > 0,
      content: (
        <CheckboxList
          idPrefix="category"
          values={options.categories.map((c) => ({ id: c.slug, name: c.name, count: c.count }))}
          isChecked={(slug) => filters.categories.includes(slug)}
          onToggle={(slug) => toggle("category", slug)}
        />
      ),
    });
  }
  for (const facet of options.facets) {
    sections.push({
      id: `facet-${facet.id}`,
      title: facet.name,
      active: facet.values.some((v) => filters.facetValueIds.includes(v.id)),
      content: (
        <CheckboxList
          idPrefix={`facet-${facet.id}`}
          values={facet.values}
          isChecked={(id) => filters.facetValueIds.includes(id)}
          onToggle={(id) => toggle("facets", `${facet.id}:${id}`)}
        />
      ),
    });
  }
  if (options.priceBounds) {
    const bounds = options.priceBounds;
    sections.push({
      id: "price",
      title: t.price,
      active: filters.price != null,
      content: (
        <PriceSlider
          key={filters.price ? encodePriceRange(filters.price) : "all"}
          min={bounds.min}
          max={bounds.max}
          value={{
            min: Math.max(bounds.min, filters.price?.min ?? bounds.min),
            max: Math.min(bounds.max, filters.price?.max ?? bounds.max),
          }}
          format={formatCents}
          labels={{
            min: format(t.priceFrom, { price: "" }).trim(),
            max: format(t.priceUpTo, { price: "" }).trim(),
          }}
          onCommit={(range) => set("price", range ? encodePriceRange(range) : null)}
        />
      ),
    });
  }
  sections.push({
    id: "availability",
    title: t.availability,
    active: filters.inStockOnly,
    content: (
      <div className="flex items-center gap-2.5">
        <Checkbox
          id="in-stock-only"
          checked={filters.inStockOnly}
          onCheckedChange={() => set("inStock", filters.inStockOnly ? null : "1")}
        />
        <Label
          htmlFor="in-stock-only"
          className="cursor-pointer text-sm font-normal text-foreground/85 hover:text-primary"
        >
          {t.inStockOnly}
        </Label>
      </div>
    ),
  });

  const defaultOpen = sections
    .filter((section, index) => section.active || index < OPEN_SECTIONS)
    .map((section) => section.id);

  return (
    <div className="space-y-2">
      <SelectedFilters options={options} filters={filters} navigation={navigation} />
      <div className="flex items-center gap-2 border-b border-foreground pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">{t.filter}</h2>
        {isPending && <Spinner className="size-3.5 animate-spin text-muted-foreground" />}
      </div>
      <Accordion type="multiple" defaultValue={defaultOpen}>
        {sections.map((section) => (
          <AccordionItem key={section.id} value={section.id} className="border-border">
            <AccordionTrigger className="py-4 text-sm font-semibold">
              {section.title}
            </AccordionTrigger>
            <AccordionContent className="max-w-none pb-5">{section.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function CheckboxList({
  idPrefix,
  values,
  isChecked,
  onToggle,
}: {
  idPrefix: string;
  values: Array<{ id: string; name: string; count: number }>;
  isChecked: (id: string) => boolean;
  onToggle: (id: string) => void;
}) {
  const t = useT().catalog;
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = values.length - VISIBLE_VALUES;
  const visible =
    expanded || hiddenCount <= 0
      ? values
      : values.filter((value, index) => index < VISIBLE_VALUES || isChecked(value.id));

  return (
    <div className="space-y-2.5">
      {visible.map((value) => {
        const id = `${idPrefix}-${value.id}`;
        return (
          <div key={value.id} className="flex items-center gap-2.5">
            <Checkbox
              id={id}
              checked={isChecked(value.id)}
              onCheckedChange={() => onToggle(value.id)}
            />
            <Label
              htmlFor={id}
              className="flex flex-1 cursor-pointer items-center justify-between gap-2 text-sm font-normal text-foreground/85 transition-colors hover:text-primary"
            >
              <span>{value.name}</span>
              <span className="text-xs tabular-nums text-muted-foreground">({value.count})</span>
            </Label>
          </div>
        );
      })}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="pt-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
        >
          {expanded ? t.showLess : t.showMore(hiddenCount)}
        </button>
      )}
    </div>
  );
}

/** "You have selected": a removable chip per applied filter + "Remove filters". */
function SelectedFilters({
  options,
  filters,
  navigation,
}: {
  options: FilterOptions;
  filters: SearchFilters;
  navigation: ReturnType<typeof useFilterNavigation>;
}) {
  const locale = useLocale();
  const t = useT().catalog;
  const { searchParams, toggle, set, clearFilters } = navigation;

  const facetValueNames = new Map(
    options.facets.flatMap((facet) => facet.values.map((value) => [value.id, value.name] as const))
  );
  const categoryNames = new Map(options.categories.map((c) => [c.slug, c.name]));
  const chips: Array<{ key: string; label: string; remove: () => void }> = [
    ...filters.categories.map((slug) => ({
      key: `category-${slug}`,
      label: categoryNames.get(slug) ?? slug,
      remove: () => toggle("category", slug),
    })),
    ...filters.facetValueIds.map((valueId) => {
      const entry = searchParams.getAll("facets").find((f) => f.split(":").pop() === valueId);
      return {
        key: `facet-${valueId}`,
        label: facetValueNames.get(valueId) ?? valueId,
        remove: () => toggle("facets", entry ?? valueId),
      };
    }),
    ...(filters.price
      ? [
          {
            key: "price",
            label: formatPriceRange(filters.price, options.currencyCode, locale, {
              upTo: t.priceUpTo,
              from: t.priceFrom,
            }),
            remove: () => set("price", null),
          },
        ]
      : []),
    ...(filters.inStockOnly
      ? [{ key: "inStock", label: t.inStockOnly, remove: () => set("inStock", null) }]
      : []),
  ];

  if (!chips.length) return null;

  return (
    <div className="mb-4 space-y-3 bg-secondary/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em]">{t.youSelected}</h2>
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
        >
          {t.removeFilters}
        </button>
      </div>
      <ul className="flex flex-wrap gap-2" aria-label={t.activeFilters}>
        {chips.map((chip) => (
          <li key={chip.key}>
            <button
              type="button"
              onClick={chip.remove}
              aria-label={format(t.removeFilter, { name: chip.label })}
              className="inline-flex items-center gap-1.5 border border-foreground/20 bg-background px-2.5 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
            >
              {chip.label}
              <X className="size-3" weight="bold" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
