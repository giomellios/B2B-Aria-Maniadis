import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale, getT } from "@/lib/i18n/server";
import { format } from "@/lib/i18n/dictionaries";
import {
  ProductGrid,
  CollectionHeader,
  getCollectionMetadata,
  getCollectionProducts,
  getSearchFilterOptions,
} from "@/features/catalog/server";
import { FacetFilters, ProductGridSkeleton } from "@/features/catalog";
import {
  SITE_NAME,
  truncateDescription,
  buildAlternates,
  buildCanonicalUrl,
  buildOgImages,
} from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/collection/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getT();
  const result = await getCollectionMetadata(slug, locale);
  const collection = result.data.collection;

  if (!collection) {
    return {
      title: t.meta.collectionNotFound,
    };
  }

  const description =
    truncateDescription(collection.description) ||
    format(t.meta.browseCollection, { name: collection.name, site: SITE_NAME });

  return {
    title: collection.name,
    description,
    alternates: buildAlternates(`/collection/${collection.slug}`, locale),
    openGraph: {
      title: collection.name,
      description,
      type: "website",
      url: buildCanonicalUrl(`/collection/${collection.slug}`, locale),
      images: buildOgImages(collection.featuredAsset?.preview, collection.name),
    },
    twitter: {
      card: "summary_large_image",
      title: collection.name,
      description,
      images: collection.featuredAsset?.preview ? [collection.featuredAsset.preview] : undefined,
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/[locale]/collection/[slug]">) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;

  const locale = await getLocale();
  const productDataPromise = getCollectionProducts(slug, searchParamsResolved, locale);
  const filterOptionsPromise = getSearchFilterOptions(searchParamsResolved, locale, slug);

  return (
    <div className="frame mt-header pt-8 pb-20">
      <Suspense
        fallback={<div className="mb-10 h-40 animate-pulse rounded-md bg-foreground/[0.04]" />}
      >
        <CollectionHeader slug={slug} />
      </Suspense>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr] lg:gap-12">
        {/* Filters Sidebar */}
        <aside className="lg:sticky lg:top-sticky lg:max-h-[calc(100vh-var(--spacing-sticky)-1rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
          <Suspense
            fallback={<div className="h-64 animate-pulse rounded-md bg-foreground/[0.04]" />}
          >
            <FacetFilters filterOptionsPromise={filterOptionsPromise} showCategories={false} />
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
