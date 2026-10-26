import { readFragment, ResultOf } from "@/lib/api/graphql";
import { ProductCard } from "@/features/catalog/components/product-card";
import { Pagination } from "@/components/shared/pagination";
import { getT } from "@/lib/i18n/server";
import { SortDropdown } from "@/features/catalog/components/sort-dropdown";
import { ListingViewControls, LoadMore } from "@/features/catalog/components/listing-controls";
import { SearchProductsQuery } from "@/features/catalog/services/queries";
import { ProductCardFragment } from "@/features/catalog/services/fragments";
import { getProductCardImageFallbacks } from "@/features/catalog/services/product-card-images.service";
import { getAuthToken } from "@/lib/api/auth-token";
import { getListingView } from "@/features/catalog/utils/search-helpers";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  productDataPromise: Promise<{
    data: ResultOf<typeof SearchProductsQuery>;
    token?: string;
  }>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function ProductGrid({ productDataPromise, searchParams }: ProductGridProps) {
  const [result, t] = await Promise.all([productDataPromise, getT()]);
  const view = getListingView(searchParams);

  const searchResult = result.data.search;
  const totalPages = Math.ceil(searchResult.totalItems / view.perPage);
  const shown = Math.min(searchResult.totalItems, view.skip + searchResult.items.length);

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-base tabular-nums">{t.catalog.productCount(searchResult.totalItems)}</p>
      <div className="flex flex-wrap items-center gap-5">
        <ListingViewControls perPage={view.perPage} grid={view.grid} />
        <SortDropdown />
      </div>
    </div>
  );

  if (!searchResult.items.length) {
    return (
      <div className="space-y-8">
        {toolbar}
        <div className="space-y-2 rounded-xl bg-card px-6 py-12">
          <p className="text-2xl font-semibold text-foreground">{t.catalog.noMatches}</p>
          <p className="text-sm text-muted-foreground">{t.catalog.noMatchesHint}</p>
        </div>
      </div>
    );
  }

  const productsWithData = searchResult.items.map((item) => ({
    item,
    data: readFragment(ProductCardFragment, item),
  }));

  const missingImageSlugs = productsWithData
    .map(({ data }) => data)
    .filter((product) => {
      return !product.productAsset?.preview && !product.productVariantAsset?.preview;
    })
    .map((product) => product.slug)
    .filter(Boolean);

  const fallbackImagesBySlug = await getProductCardImageFallbacks(
    missingImageSlugs,
    await getAuthToken()
  );

  return (
    <div className="space-y-8">
      {toolbar}

      <div
        className={cn(
          "grid grid-cols-2 gap-x-4 gap-y-8 lg:gap-x-5",
          view.grid === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
        )}
      >
        {productsWithData.map(({ item, data }) => (
          <div key={data.productId}>
            <ProductCard
              product={item}
              fallbackImageUrl={fallbackImagesBySlug.get(data.slug) ?? null}
            />
          </div>
        ))}
      </div>

      <div className="space-y-8 pt-6">
        <LoadMore
          shown={shown}
          total={searchResult.totalItems}
          more={view.more}
          hasMore={view.lastPage < totalPages}
        />
        {totalPages > 1 && <Pagination currentPage={view.lastPage} totalPages={totalPages} />}
      </div>
    </div>
  );
}
