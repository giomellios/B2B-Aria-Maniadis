import { Link } from "@/lib/i18n/navigation";

export interface SheetRun {
  code: string;
  name: string;
  pages: string;
  /** e.g. "31 designs online"; absent when the store has no products for it yet. */
  count?: string;
  href: string;
  linkLabel: string;
}

/**
 * The islands of the 2026 catalogue as one card each: its name, its catalogue pages and how many
 * of its designs are on the store. Each card opens that island in the catalogue.
 */
export function IslandSheet({ runs, label }: { runs: SheetRun[]; label: string }) {
  return (
    <ul aria-label={label} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {runs.map((run, i) => (
        <li key={run.code} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
          <Link
            href={run.href}
            aria-label={run.linkLabel}
            className="group flex h-full min-h-36 flex-col justify-between rounded-xl bg-card p-5 transition-colors duration-200 hover:bg-accent md:min-h-44"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="text-xl font-semibold tracking-[-0.01em] md:text-2xl">
                {run.name}
              </span>
              <span
                aria-hidden
                className="text-xl text-muted-foreground transition-[transform,color] duration-200 group-hover:translate-x-1 group-hover:text-gold"
              >
                →
              </span>
            </span>
            <span className="text-sm tabular-nums text-muted-foreground">
              {run.pages}
              {run.count && (
                <>
                  <br />
                  {run.count}
                </>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
