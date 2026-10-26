import { Suspense } from "react";
import { Link } from "@/lib/i18n/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
import { format } from "@/lib/i18n/dictionaries";
import { Button } from "@/design-system";
import { IslandSheet, type SheetRun } from "@/features/home/components/island-sheet";
import { ISLAND_RUNS, type CatalogueRun } from "@/features/home/data/catalogue";
import { getDestinations, type Destination } from "@/features/home/services/home.service";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { getAuthToken } from "@/lib/api/auth-token";

export const PHONE = "(2810) 319618";
export const PHONE_HREF = "tel:+302810319618";
export const EMAIL = "maniadibags@gmail.com";

export function pagesLabel(t: Dictionary, [from, to]: [number, number]) {
  return from === to ? format(t.home.hero.page, { from }) : format(t.home.hero.pages, { from, to });
}

function toSheetRun(
  run: CatalogueRun,
  locale: Locale,
  t: Dictionary,
  destination: Destination | undefined
): SheetRun {
  const name = run.name[locale];
  return {
    code: run.code,
    name,
    pages: pagesLabel(t, run.pages),
    count: destination ? t.home.hero.designs(destination.count) : undefined,
    href: destination
      ? `/search?facets=${encodeURIComponent(destination.filter)}`
      : `/search?q=${encodeURIComponent(run.name.en)}`,
    linkLabel: format(destination ? t.home.hero.seeAll : t.home.hero.searchFor, { name }),
  };
}

/** The island cards with each island's product count, for signed-in customers only. */
async function LiveIslandSheet() {
  const locale = await getLocale();
  const [t, destinations] = await Promise.all([
    getT(),
    getDestinations(locale, await getAuthToken()),
  ]);
  const runs = ISLAND_RUNS.map((run) => toSheetRun(run, locale, t, destinations[run.code]));
  return <IslandSheet runs={runs} label={t.home.hero.sheetLabel} />;
}

/**
 * First screen: a band of small text (who, what, the range, how to reach us), the title at
 * display size, and the contact sheet of island runs starting directly under it.
 */
export async function HomeHero() {
  const locale = await getLocale();
  const t = await getT();
  const hero = t.home.hero;
  const runsWithoutCounts = ISLAND_RUNS.map((run) => toSheetRun(run, locale, t, undefined));

  return (
    <section aria-labelledby="home-title" className="px-4 pt-8 sm:px-5 md:pt-14">
      <h1
        id="home-title"
        data-reveal-load
        className="max-w-[17ch] text-[clamp(2.25rem,7.6vw,9rem)] font-bold leading-[0.9] tracking-[-0.03em]"
      >
        {hero.title}
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 md:mt-10 md:grid-cols-12">
        <p
          data-reveal-load
          style={{ "--i": 1 } as React.CSSProperties}
          className="col-span-2 max-w-[34ch] text-2xl leading-[1.25] md:col-span-6"
        >
          {hero.lead}
        </p>
        <div
          data-reveal-load
          style={{ "--i": 2 } as React.CSSProperties}
          className="col-span-2 sm:col-span-1 md:col-span-3"
        >
          <p className="text-muted-foreground">{hero.rangesLabel}</p>
          <ul>
            {hero.ranges.map((range) => (
              <li key={range}>{range}</li>
            ))}
          </ul>
        </div>
        <div
          data-reveal-load
          style={{ "--i": 3 } as React.CSSProperties}
          className="col-span-2 flex flex-col items-start gap-4 sm:col-span-1 md:col-span-3 md:items-end md:text-right"
        >
          <p>
            <a href={PHONE_HREF} className="link-underline">
              {PHONE}
            </a>
            <br />
            <a href={`mailto:${EMAIL}`} className="link-underline">
              {EMAIL}
            </a>
          </p>
          <div className="flex flex-wrap items-center gap-4 md:justify-end">
            <Link href="/sign-in" className="link-underline">
              {hero.signIn}
            </Link>
            <Button variant="gold" size="lg" asChild>
              <Link href="/register">{hero.apply}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 md:mt-24">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">{hero.islandsTitle}</h2>
        <p className="text-base text-muted-foreground">{hero.pickIsland}</p>
      </div>
      <div className="mt-6">
        <Suspense fallback={<IslandSheet runs={runsWithoutCounts} label={hero.sheetLabel} />}>
          <LiveIslandSheet />
        </Suspense>
      </div>
    </section>
  );
}
