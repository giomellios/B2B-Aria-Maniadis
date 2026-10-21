import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import type { Frame } from "@/features/home/data/catalogue";

export interface SheetRun {
  code: string;
  name: string;
  pages: string;
  /** e.g. "31 designs online"; absent when the store has no products for it yet. */
  count?: string;
  href: string;
  linkLabel: string;
  frames: Frame[];
}

/**
 * The islands of the 2026 catalogue as one card each: a single cap from that island's pages,
 * its name, its catalogue pages and how many of its designs are on the store. Each card opens
 * that island in the catalogue.
 */
export function IslandSheet({ runs, label }: { runs: SheetRun[]; label: string }) {
  return (
    <ul aria-label={label} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {runs.map((run, i) => {
        const frame = run.frames[0];
        return (
          <li key={run.code} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
            <Link href={run.href} className="group block" aria-label={run.linkLabel}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white">
                <Image
                  src={frame.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  priority={i < 4}
                  className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-base font-semibold tracking-[-0.01em] underline md:text-2xl decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover:decoration-gold">
                  {run.name}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                  {run.pages}
                </span>
              </div>
              {run.count && <p className="mt-1 text-sm text-muted-foreground">{run.count}</p>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
