import { getT } from "@/lib/i18n/server";

interface SearchTermProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export async function SearchTerm({ searchParams }: SearchTermProps) {
  const [searchParamsResolved, t] = await Promise.all([searchParams, getT()]);
  const searchTerm = (searchParamsResolved.q as string) || "";

  return (
    <div className="mb-10 space-y-4 border-b border-border pb-10">
      <p className="eyebrow">{searchTerm ? t.catalog.searchResults : t.catalog.catalogue}</p>
      <h1 className="display text-5xl leading-[1.05] md:text-6xl">
        {searchTerm ? <>&ldquo;{searchTerm}&rdquo;</> : t.catalog.allProducts}
      </h1>
    </div>
  );
}

export function SearchTermSkeleton() {
  return (
    <div className="mb-10 space-y-4 border-b border-border pb-10">
      <div className="h-3 w-24 animate-pulse rounded bg-foreground/[0.06]" />
      <div className="h-14 w-72 animate-pulse rounded bg-foreground/[0.06]" />
    </div>
  );
}
