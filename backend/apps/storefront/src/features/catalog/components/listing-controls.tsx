"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { GridFour, GridNine } from "@/design-system/icons";
import { GRID_OPTIONS, PER_PAGE_OPTIONS } from "@/features/catalog/utils/search-helpers";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/** Current URL with some query parameters replaced (null removes one). */
function useHrefWith() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value == null) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };
}

const optionClass =
  "inline-flex h-8 min-w-8 items-center justify-center px-1.5 text-xs font-semibold tabular-nums transition-colors";

/** "Per page: 12 · 24 · 48" and the 3/4-per-row switch (desktop). */
export function ListingViewControls({ perPage, grid }: { perPage: number; grid: number }) {
  const t = useT().catalog;
  const hrefWith = useHrefWith();

  return (
    <div className="flex items-center gap-5">
      <div className="hidden items-center gap-1 md:flex">
        <span className="mr-1 text-sm font-semibold text-muted-foreground">{t.perPage}</span>
        {PER_PAGE_OPTIONS.map((option) => (
          <Link
            key={option}
            href={hrefWith({
              perPage: option === PER_PAGE_OPTIONS[0] ? null : String(option),
              page: null,
              more: null,
            })}
            scroll={false}
            aria-current={option === perPage ? "true" : undefined}
            className={cn(
              optionClass,
              option === perPage
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option}
          </Link>
        ))}
      </div>
      <div className="hidden items-center gap-1 lg:flex">
        {GRID_OPTIONS.map((option) => {
          const Icon = option === 4 ? GridNine : GridFour;
          return (
            <Link
              key={option}
              href={hrefWith({ grid: option === GRID_OPTIONS[0] ? null : String(option) })}
              scroll={false}
              aria-label={t.gridView(option)}
              aria-current={option === grid ? "true" : undefined}
              className={cn(
                optionClass,
                option === grid ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" weight={option === grid ? "fill" : "regular"} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** "You've seen 12 of 172 products", a progress bar and "Load more". */
export function LoadMore({
  shown,
  total,
  more,
  hasMore,
}: {
  shown: number;
  total: number;
  more: number;
  hasMore: boolean;
}) {
  const t = useT().catalog;
  const hrefWith = useHrefWith();

  return (
    <div className="mx-auto flex max-w-xs flex-col items-center gap-4 text-center">
      <p className="text-sm text-muted-foreground">{t.seenOf(shown, total)}</p>
      <div className="h-0.5 w-full bg-border" aria-hidden>
        <div
          className="h-full bg-primary transition-[width] duration-500"
          style={{ width: `${total ? Math.min(100, (shown / total) * 100) : 0}%` }}
        />
      </div>
      {hasMore && (
        <Link
          href={hrefWith({ more: String(more + 1) })}
          scroll={false}
          className="inline-flex h-11 w-full items-center justify-center border border-foreground px-6 text-xs font-semibold transition-colors hover:bg-foreground hover:text-background"
        >
          {t.loadMore}
        </Link>
      )}
    </div>
  );
}
