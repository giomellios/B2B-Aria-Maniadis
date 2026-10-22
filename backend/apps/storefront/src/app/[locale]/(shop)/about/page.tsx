import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
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
  const offers = [
    { id: "custom", title: about.customTitle, text: about.customText },
    { id: "stands", title: about.standsTitle, text: about.standsText },
  ];

  return (
    <main className="pt-header">
      <section aria-labelledby="about-title" className="px-4 pt-8 sm:px-5 md:pt-14">
        <div className="grid gap-8 md:grid-cols-12 md:gap-5">
          <div className="md:col-span-8">
            <h1
              id="about-title"
              data-reveal-load
              className="text-[clamp(2.25rem,7.6vw,9rem)] font-bold leading-[0.9] tracking-[-0.03em]"
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
            className="grid grid-cols-3 gap-3 self-end md:col-span-4 md:grid-cols-1"
          >
            {facts.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-card p-4 md:p-5">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-lg font-semibold md:text-2xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
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

      <section aria-label={about.customTitle} className="mt-36 px-4 sm:px-5 md:mt-52">
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {offers.map((offer, i) => (
            <article
              key={offer.id}
              data-reveal
              style={{ "--i": i } as React.CSSProperties}
              className="flex min-h-72 flex-col justify-between rounded-2xl bg-card p-6 md:p-10"
            >
              <h2 className="text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                {offer.title}
              </h2>
              <p className="mt-8 max-w-[52ch] text-lg leading-snug">{offer.text}</p>
            </article>
          ))}
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
