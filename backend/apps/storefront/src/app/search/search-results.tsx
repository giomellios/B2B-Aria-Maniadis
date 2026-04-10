import { Suspense } from "react";
import { FacetFilters } from "@/components/commerce/facet-filters";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import { ProductGrid } from "@/components/commerce/product-grid";
import { buildSearchInput, getCurrentPage } from "@/lib/search-helpers";
import { query } from "@/lib/vendure/api";
import { SearchProductsQuery } from "@/lib/vendure/queries";

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

  const productDataPromise = query(SearchProductsQuery, {
    input: buildSearchInput({ searchParams: searchParamsResolved }),
    revalidateSeconds: 60,
  });

  return (
    <div className="space-y-6">
      {!searchTerm ? (
        <p className="text-sm text-muted-foreground">
          Browse all products, or use search to narrow by product name, SKU, or keyword.
        </p>
      ) : null}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
            <FacetFilters productDataPromise={productDataPromise} />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid productDataPromise={productDataPromise} currentPage={page} take={12} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
