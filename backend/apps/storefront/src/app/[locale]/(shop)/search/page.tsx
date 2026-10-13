import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/features/catalog/server";
import { SearchTerm, SearchTermSkeleton, SearchResultsSkeleton } from "@/features/catalog";
import { SITE_NAME, noIndexRobots } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
import { format } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  searchParams,
}: PageProps<"/[locale]/search">): Promise<Metadata> {
  const [resolvedParams, t] = await Promise.all([searchParams, getT()]);
  const searchQuery = resolvedParams.q as string | undefined;

  const title = searchQuery
    ? format(t.meta.searchResultsFor, { q: searchQuery })
    : t.meta.searchProducts;

  return {
    title,
    description: searchQuery
      ? format(t.meta.searchDescriptionQuery, { q: searchQuery, site: SITE_NAME })
      : format(t.meta.searchDescription, { site: SITE_NAME }),
    robots: noIndexRobots(),
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/[locale]/search">) {
  return (
    <div className="container mx-auto mt-16 px-4 pt-12 pb-20 md:pt-16">
      <Suspense fallback={<SearchTermSkeleton />}>
        <SearchTerm searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
