import { getT } from "@/lib/i18n/server";
import { DIGITAL_CATALOGUE_URL } from "@/lib/config/links";

const sectionHead =
  "text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-semibold leading-none tracking-[-0.02em]";

/**
 * What only ARIA offers a shop: its own place name on the cap, free display stands and registered
 * designs, beside the way into the printed catalogue.
 */
export async function TownMosaic() {
  const t = await getT();
  const town = t.home.town;
  const facts = [town.name, town.stands, town.registered];

  return (
    <section aria-labelledby="town-title" className="mt-36 px-4 sm:px-5 md:mt-52">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-5">
        <h2 id="town-title" data-reveal className={`${sectionHead} lg:col-span-4`}>
          {town.title}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:col-span-8">
          {facts.map((fact, i) => (
            <li
              key={fact}
              data-reveal
              style={{ "--i": i } as React.CSSProperties}
              className="flex min-h-40 items-end rounded-xl bg-card p-5 text-lg leading-snug md:p-6"
            >
              {fact}
            </li>
          ))}
          <li data-reveal style={{ "--i": 3 } as React.CSSProperties}>
            <a
              href={DIGITAL_CATALOGUE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full min-h-40 flex-col justify-between rounded-xl bg-gold p-5 text-lg font-medium text-gold-foreground transition-opacity hover:opacity-90 md:p-6"
            >
              {town.open}
              <span
                aria-hidden
                className="self-end text-2xl transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
