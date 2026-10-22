import { Link } from "@/lib/i18n/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
import { ISLAND_RUNS } from "@/features/home/data/catalogue";
import { pagesLabel } from "@/features/home/components/home-hero";

/** Side facts beside a wide paragraph, then the destinations as the catalogue indexes them. */
export async function AboutFacts() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const about = t.home.about;
  const facts = [
    [about.founded, "1965"],
    [about.based, about.basedValue],
    [about.catalogue, about.catalogueValue],
  ];
  const half = Math.ceil(ISLAND_RUNS.length / 2);
  const columns = [ISLAND_RUNS.slice(0, half), ISLAND_RUNS.slice(half)];

  return (
    <section aria-labelledby="about-title" className="mt-36 px-4 sm:px-5 md:mt-52">
      <div className="grid gap-10 md:grid-cols-[minmax(0,34fr)_minmax(0,66fr)] md:gap-0">
        <dl className="order-2 grid grid-cols-3 gap-5 md:order-1 md:block md:space-y-6" data-reveal>
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-base">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="order-1 md:order-2 md:pr-[10%]">
          <h2
            id="about-title"
            data-reveal
            className="text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-semibold leading-none tracking-[-0.02em]"
          >
            {about.title}
          </h2>
          <p
            data-reveal
            style={{ "--i": 1 } as React.CSSProperties}
            className="mt-8 text-[clamp(1.1875rem,1.7vw,1.625rem)] leading-[1.35]"
          >
            {about.text}
          </p>
          <Link
            href="/about"
            className="link-underline mt-6 inline-block text-base text-gold"
            data-reveal
            style={{ "--i": 2 } as React.CSSProperties}
          >
            {about.more} →
          </Link>
        </div>
      </div>

      <div className="mt-24 grid gap-6 md:mt-32 md:grid-cols-[minmax(0,34fr)_minmax(0,66fr)] md:gap-0">
        <h3 className="text-base" data-reveal>
          {about.destinations}
        </h3>
        <div className="grid gap-x-16 gap-y-0 sm:grid-cols-2 md:max-w-[40rem]" data-reveal>
          {columns.map((column, i) => (
            <ul key={i}>
              {column.map((run) => (
                <li key={run.code} className="flex justify-between gap-4 py-2 text-base">
                  <span>{run.name[locale]}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {pagesLabel(t, run.pages)}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
