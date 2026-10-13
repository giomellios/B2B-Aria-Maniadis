import { Suspense } from "react";
import { FacetFilters } from "@/features/catalog/components/facet-filters";
import { ProductGridSkeleton } from "@/features/catalog/components/product-grid-skeleton";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { getCurrentPage } from "@/features/catalog/utils/search-helpers";
import { getLocale, getT } from "@/lib/i18n/server";
import { searchProducts } from "@/features/catalog/services/catalog.service";

interface SearchResultsProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
}

export async function SearchResults({ searchParams }: SearchResultsProps) {
  const searchParamsResolved = await searchParams;
  const searchTerm = (searchParamsResolved.q as string)?.trim();

  const page = getCurrentPage(searchParamsResolved);

  const productDataPromise = searchProducts(searchParamsResolved, await getLocale());

  return (
    <div className="space-y-8">
      {!searchTerm ? (
        <p className="text-sm text-muted-foreground">{(await getT()).catalog.browseHint}</p>
      ) : null}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr] lg:gap-12">
        {/* Filters Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Suspense
            fallback={<div className="h-64 animate-pulse rounded-md bg-foreground/[0.04]" />}
          >
            <FacetFilters productDataPromise={productDataPromise} />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid productDataPromise={productDataPromise} currentPage={page} take={12} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
