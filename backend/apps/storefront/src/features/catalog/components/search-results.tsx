import { Suspense } from "react";
import { FacetFilters } from "@/features/catalog/components/facet-filters";
import { ProductGridSkeleton } from "@/features/catalog/components/product-grid-skeleton";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { getCurrentPage } from "@/features/catalog/utils/search-helpers";
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

  const productDataPromise = searchProducts(searchParamsResolved);

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
