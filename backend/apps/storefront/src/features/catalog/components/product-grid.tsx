import { readFragment, ResultOf } from "@/lib/api/graphql";
import { ProductCard } from "@/features/catalog/components/product-card";
import { Pagination } from "@/components/shared/pagination";
import { getT } from "@/lib/i18n/server";
import { SortDropdown } from "@/features/catalog/components/sort-dropdown";
import { SearchProductsQuery } from "@/features/catalog/services/queries";
import { ProductCardFragment } from "@/features/catalog/services/fragments";
import { getProductCardImageFallbacks } from "@/features/catalog/services/product-card-images.service";

interface ProductGridProps {
  productDataPromise: Promise<{
    data: ResultOf<typeof SearchProductsQuery>;
    token?: string;
  }>;
  currentPage: number;
  take: number;
}

export async function ProductGrid({ productDataPromise, currentPage, take }: ProductGridProps) {
  const [result, t] = await Promise.all([productDataPromise, getT()]);

  const searchResult = result.data.search;
  const totalPages = Math.ceil(searchResult.totalItems / take);

  if (!searchResult.items.length) {
    return (
      <div className="space-y-2 rounded-md border border-dashed border-border py-20 text-center">
        <p className="font-serif text-2xl text-foreground">{t.catalog.noMatches}</p>
        <p className="text-sm text-muted-foreground">{t.catalog.noMatchesHint}</p>
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

  const fallbackImagesBySlug = await getProductCardImageFallbacks(missingImageSlugs);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <p className="text-sm tabular-nums text-muted-foreground">
          {t.catalog.productCount(searchResult.totalItems)}
        </p>
        <SortDropdown />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
        {productsWithData.map(({ item, data }, i) => {
          const productData = readFragment(ProductCardFragment, item);
          return (
            <div
              key={productData.productId}
              className="animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-both duration-500 ease-out"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            >
              <ProductCard
                product={item}
                fallbackImageUrl={fallbackImagesBySlug.get(data.slug) ?? null}
              />
            </div>
          );
        })}
      </div>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
    </div>
  );
}
