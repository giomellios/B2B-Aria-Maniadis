import { Suspense } from "react";
import { FacetFilters } from "@/features/catalog/components/facet-filters";
import { ProductGridSkeleton } from "@/features/catalog/components/product-grid-skeleton";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { getLocale, getT } from "@/lib/i18n/server";
import {
  getSearchFilterOptions,
  searchProducts,
} from "@/features/catalog/services/catalog.service";

interface SearchResultsProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function SearchResults({ searchParams }: SearchResultsProps) {
  const [searchParamsResolved, locale] = await Promise.all([searchParams, getLocale()]);
  const searchTerm = (searchParamsResolved.q as string)?.trim();

  const productDataPromise = searchProducts(searchParamsResolved, locale);
  const filterOptionsPromise = getSearchFilterOptions(searchParamsResolved, locale);

  return (
    <div className="space-y-8">
      {!searchTerm ? (
        <p className="text-sm text-muted-foreground">{(await getT()).catalog.browseHint}</p>
      ) : null}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr] lg:gap-12">
        {/* Filters Sidebar */}
        <aside className="lg:sticky lg:top-sticky lg:max-h-[calc(100vh-var(--spacing-sticky)-1rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
          <Suspense
            fallback={<div className="h-64 animate-pulse rounded-md bg-foreground/[0.04]" />}
          >
            <FacetFilters filterOptionsPromise={filterOptionsPromise} />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <div className="space-y-6">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid
              productDataPromise={productDataPromise}
              searchParams={searchParamsResolved}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
