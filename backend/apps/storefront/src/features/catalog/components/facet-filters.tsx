"use client";

import { use } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ResultOf } from "@/lib/api/graphql";
import { Checkbox, Label, Button } from "@/design-system";
import { SearchProductsQuery } from "@/features/catalog/services/queries";
import { useT } from "@/lib/i18n/provider";

interface FacetFiltersProps {
  productDataPromise: Promise<{
    data: ResultOf<typeof SearchProductsQuery>;
    token?: string;
  }>;
}

export function FacetFilters({ productDataPromise }: FacetFiltersProps) {
  const result = use(productDataPromise);
  const searchResult = result.data.search;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useT().catalog;

  // Group facet values by facet
  interface FacetGroup {
    id: string;
    name: string;
    values: Array<{ id: string; name: string; count: number }>;
  }

  const facetGroups = searchResult.facetValues.reduce((acc: Record<string, FacetGroup>, item) => {
    const facetName = item.facetValue.facet.name;
    if (!acc[facetName]) {
      acc[facetName] = {
        id: item.facetValue.facet.id,
        name: facetName,
        values: [],
      };
    }
    acc[facetName].values.push({
      id: item.facetValue.id,
      name: item.facetValue.name,
      count: item.count,
    });
    return acc;
  }, {});

  const selectedFacets = searchParams.getAll("facets");
  const inStockParam = searchParams.get("inStock");
  const inStockOnly = inStockParam === "1" || inStockParam === "true" || inStockParam === "yes";

  const toggleFacet = (facetId: string) => {
    const params = new URLSearchParams(searchParams);
    const current = params.getAll("facets");

    if (current.includes(facetId)) {
      params.delete("facets");
      current.filter((id) => id !== facetId).forEach((id) => params.append("facets", id));
    } else {
      params.append("facets", facetId);
    }

    // Reset to page 1 when filters change
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleInStockOnly = () => {
    const params = new URLSearchParams(searchParams);
    if (inStockOnly) {
      params.delete("inStock");
    } else {
      params.set("inStock", "1");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("facets");
    params.delete("inStock");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = selectedFacets.length > 0 || inStockOnly;
  const hasFacetGroups = Object.keys(facetGroups).length > 0;

  return (
    <div className="space-y-7">
      <div className="flex h-9 items-center justify-between border-b border-border pb-4 box-content">
        <h2 className="eyebrow">{t.filter}</h2>
        {hasActiveFilters && (
          <Button
            variant="link"
            size="sm"
            onClick={clearFilters}
            className="h-auto px-0 text-xs text-muted-foreground hover:text-primary animate-in fade-in-0 duration-200"
          >
            {t.clearAll}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">{t.availability}</h3>
        <div className="flex items-center space-x-2">
          <Checkbox id="in-stock-only" checked={inStockOnly} onCheckedChange={toggleInStockOnly} />
          <Label
            htmlFor="in-stock-only"
            className="cursor-pointer text-sm font-normal text-foreground/80 transition-colors hover:text-primary"
          >
            {t.inStockOnly}
          </Label>
        </div>
      </div>

      {!hasFacetGroups ? <p className="text-sm text-muted-foreground">{t.noFacets}</p> : null}

      {Object.entries(facetGroups).map(([facetName, facet]) => (
        <div key={facet.id} className="space-y-3">
          <h3 className="text-sm font-semibold">{facetName}</h3>
          <div className="space-y-2.5">
            {facet.values.map((value) => {
              const isChecked = selectedFacets.includes(value.id);
              return (
                <div key={value.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={value.id}
                    checked={isChecked}
                    onCheckedChange={() => toggleFacet(value.id)}
                  />
                  <Label
                    htmlFor={value.id}
                    className="flex cursor-pointer items-center gap-2 text-sm font-normal text-foreground/80 transition-colors hover:text-primary"
                  >
                    {value.name}
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {value.count}
                    </span>
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
