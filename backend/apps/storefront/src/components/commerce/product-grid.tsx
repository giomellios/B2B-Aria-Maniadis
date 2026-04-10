import { readFragment, ResultOf } from "@/graphql";
import { ProductCard } from "./product-card";
import { Pagination } from "@/components/shared/pagination";
import { SortDropdown } from "./sort-dropdown";
import { SearchProductsQuery } from "@/lib/vendure/queries";
import { ProductCardFragment } from "@/lib/vendure/fragments";

interface ProductGridProps {
  productDataPromise: Promise<{
    data: ResultOf<typeof SearchProductsQuery>;
    token?: string;
  }>;
  currentPage: number;
  take: number;
}

export async function ProductGrid({ productDataPromise, currentPage, take }: ProductGridProps) {
  const result = await productDataPromise;

  const searchResult = result.data.search;
  const totalPages = Math.ceil(searchResult.totalItems / take);

  if (!searchResult.items.length) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-muted-foreground">No products match your filters.</p>
        <p className="text-sm text-muted-foreground">
          Try clearing filters or turning off in-stock filtering.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {searchResult.totalItems} {searchResult.totalItems === 1 ? "product" : "products"}
        </p>
        <SortDropdown />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResult.items.map((product) => {
          const productData = readFragment(ProductCardFragment, product);
          return <ProductCard key={productData.productId} product={product} />;
        })}
      </div>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
    </div>
  );
}
