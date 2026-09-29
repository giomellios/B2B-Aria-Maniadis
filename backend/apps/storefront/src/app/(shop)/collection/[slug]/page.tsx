import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ProductGrid,
  CollectionHeader,
  getCollectionMetadata,
  getCollectionProducts,
} from "@/features/catalog/server";
import { FacetFilters, ProductGridSkeleton, getCurrentPage } from "@/features/catalog";
import { SITE_NAME, truncateDescription, buildCanonicalUrl, buildOgImages } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/collection/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCollectionMetadata(slug);
  const collection = result.data.collection;

  if (!collection) {
    return {
      title: "Collection Not Found",
    };
  }

  const description =
    truncateDescription(collection.description) ||
    `Browse our ${collection.name} collection at ${SITE_NAME}`;

  return {
    title: collection.name,
    description,
    alternates: {
      canonical: buildCanonicalUrl(`/collection/${collection.slug}`),
    },
    openGraph: {
      title: collection.name,
      description,
      type: "website",
      url: buildCanonicalUrl(`/collection/${collection.slug}`),
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
}: PageProps<"/collection/[slug]">) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const page = getCurrentPage(searchParamsResolved);

  const productDataPromise = getCollectionProducts(slug, searchParamsResolved);

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Suspense fallback={<div className="mb-8 h-24 animate-pulse rounded-lg bg-muted" />}>
        <CollectionHeader slug={slug} />
      </Suspense>
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
