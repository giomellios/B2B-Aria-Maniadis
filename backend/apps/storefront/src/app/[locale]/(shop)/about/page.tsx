import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
import { format } from "@/lib/i18n/dictionaries";
import { Button } from "@/design-system";
import { DIGITAL_CATALOGUE_URL } from "@/lib/config/links";
import { buildAlternates } from "@/lib/utils";
import { ISLAND_RUNS } from "@/features/home";
import { pagesLabel } from "@/features/home/server";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return {
    title: t.about.metaTitle,
    description: t.about.metaDescription,
    alternates: buildAlternates("/about", locale),
  };
}

// Location shots from the 2026 catalogue: file name and printed page.
const SHOTS = [
  ["p1", 0],
  ["p193", 192],
  ["p242", 241],
  ["p291", 290],
  ["p297", 296],
  ["p109", 108],
  ["p316", 315],
  ["p147", 146],
  ["p250", 249],
  ["p342", 341],
] as const;

const sectionHead =
  "text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-semibold leading-none tracking-[-0.02em]";

export default async function AboutPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const about = t.about;
  const facts = [
    [about.founded, "1965"],
    [about.based, about.basedValue],
    [about.catalogueLabel, about.catalogueValue],
  ];

  return (
    <main className="pt-header">
      <section aria-labelledby="about-title" className="px-4 pt-8 sm:px-5 md:pt-14">
        <div className="grid gap-8 md:grid-cols-12 md:gap-5">
          <div className="md:col-span-8">
            <h1
              id="about-title"
              data-reveal-load
              className="text-[clamp(2.75rem,7.6vw,9rem)] font-bold leading-[0.9] tracking-[-0.03em]"
            >
              {about.title}
            </h1>
            <p
              data-reveal-load
              style={{ "--i": 1 } as React.CSSProperties}
              className="mt-8 max-w-[34ch] text-2xl leading-[1.25]"
            >
              {about.lead}
            </p>
          </div>
          <dl
            data-reveal-load
            style={{ "--i": 2 } as React.CSSProperties}
            className="grid grid-cols-3 gap-5 self-end md:col-span-4 md:grid-cols-1 md:justify-items-end md:text-right"
          >
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-base">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <h2 className="sr-only">{about.rangeTitle}</h2>
        <ul className="mt-12 flex flex-wrap gap-2 md:mt-16">
          {SHOTS.map(([file, page], i) => (
            <li
              key={file}
              className="group relative grow overflow-hidden rounded-lg"
              data-reveal
              style={{ "--i": i % 5 } as React.CSSProperties}
            >
              <Image
                src={`/catalogue/scenes/${file}.jpg`}
                alt={
                  page === 0
                    ? about.coverAlt
                    : format(about.photoAlt, { code: format(t.home.hero.page, { from: page }) })
                }
                width={1394}
                height={1900}
                sizes="(min-width: 768px) 20vw, 45vw"
                priority={i < 5}
                className="h-56 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] md:h-[22rem]"
              />
            </li>
          ))}
          <li aria-hidden className="h-0 grow-[40]" />
        </ul>
      </section>

      <section aria-labelledby="story-title" className="mt-36 px-4 sm:px-5 md:mt-52">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,34fr)_minmax(0,66fr)] lg:gap-0">
          <h2 id="story-title" data-reveal className={sectionHead}>
            {about.storyTitle}
          </h2>
          <div className="space-y-6 lg:pr-[10%]">
            {about.story.map((paragraph, i) => (
              <p
                key={i}
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
                className="text-[clamp(1.1875rem,1.7vw,1.5rem)] leading-[1.4]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="custom-title" className="mt-36 px-4 sm:px-5 md:mt-52">
        <div className="grid gap-8 md:grid-cols-12 md:gap-5">
          <div className="md:col-span-4">
            <h2 id="custom-title" data-reveal className={sectionHead}>
              {about.customTitle}
            </h2>
            <p data-reveal style={{ "--i": 1 } as React.CSSProperties} className="mt-6 text-base">
              {about.customText}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 md:col-span-8">
            {[14, 47].map((page, i) => (
              <Image
                key={page}
                src={`/catalogue/scenes/page-${page}.jpg`}
                alt={i === 0 ? about.customAlt : ""}
                width={1095}
                height={1500}
                sizes="(min-width: 768px) 33vw, 50vw"
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
                className="w-full rounded-lg"
              />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="stands-title" className="mt-36 px-4 sm:px-5 md:mt-52">
        <div className="grid gap-8 md:grid-cols-12 md:gap-5">
          <div className="order-2 grid grid-cols-2 gap-2 md:order-1 md:col-span-8">
            {[262, 358].map((page, i) => (
              <Image
                key={page}
                src={`/catalogue/scenes/page-${page}.jpg`}
                alt={i === 0 ? about.standsAlt : ""}
                width={1095}
                height={1500}
                sizes="(min-width: 768px) 33vw, 50vw"
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
                className="w-full rounded-lg"
              />
            ))}
          </div>
          <div className="order-1 md:order-2 md:col-span-4">
            <h2 id="stands-title" data-reveal className={sectionHead}>
              {about.standsTitle}
            </h2>
            <p data-reveal style={{ "--i": 1 } as React.CSSProperties} className="mt-6 text-base">
              {about.standsText}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="where-title" className="mt-36 px-4 sm:px-5 md:mt-52">
        <div className="grid gap-8 md:grid-cols-12 md:gap-5">
          <h2 id="where-title" data-reveal className={`${sectionHead} md:col-span-4`}>
            {t.home.about.destinations}
          </h2>
          <ul className="grid gap-x-12 sm:grid-cols-2 md:col-span-5" data-reveal>
            {ISLAND_RUNS.map((run) => (
              <li key={run.code} className="flex justify-between gap-4 py-2 text-base">
                <span>{run.name[locale]}</span>
                <span className="tabular-nums text-muted-foreground">
                  {pagesLabel(t, run.pages)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-start gap-4 md:col-span-3 md:items-end" data-reveal>
            <Button variant="gold" size="lg" asChild>
              <Link href="/register">{about.cta}</Link>
            </Button>
            <a
              href={DIGITAL_CATALOGUE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
            >
              {about.catalogue} ↗
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
