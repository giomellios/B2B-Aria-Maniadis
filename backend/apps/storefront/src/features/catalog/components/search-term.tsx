import { Breadcrumb } from "@/components/shared/breadcrumb";
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
    <div className="mb-6 space-y-3">
      <Breadcrumb
        label={t.product.breadcrumb}
        items={[
          { label: t.nav.home, href: "/" },
          searchTerm ? { label: t.nav.allProducts, href: "/search" } : { label: t.nav.allProducts },
          ...(searchTerm ? [{ label: t.catalog.searchResults }] : []),
        ]}
      />
      <h1 className="display text-[1.75rem] leading-[1.1] md:text-[2rem]">
        {searchTerm ? <>&ldquo;{searchTerm}&rdquo;</> : t.catalog.allProducts}
      </h1>
    </div>
  );
}

export function SearchTermSkeleton() {
  return (
    <div className="mb-8 space-y-5 border-b border-border pb-8">
      <div className="h-3 w-40 animate-pulse rounded bg-foreground/[0.06]" />
      <div className="h-12 w-72 animate-pulse rounded bg-foreground/[0.06]" />
    </div>
  );
}
