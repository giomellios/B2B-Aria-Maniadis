import { getT } from "@/lib/i18n/server";
import { DIGITAL_CATALOGUE_URL } from "@/lib/config/links";
import { format } from "@/lib/i18n/dictionaries";
import { cataloguePageUrl } from "@/features/home/data/catalogue";
import { pagesLabel } from "@/features/home/components/home-hero";

type RowKey =
  | "caps"
  | "kids"
  | "women"
  | "men"
  | "panama"
  | "original"
  | "straw"
  | "beach"
  | "canvas"
  | "knitted"
  | "leatherBags"
  | "wallets"
  | "backpacks"
  | "stands"
  | "index";

// Printed page ranges from the contents page of the 2026 catalogue (knitted, woven and leather
// ranges checked against the pages themselves).
const GROUPS: { key: "hats" | "bags" | "more"; rows: [RowKey, [number, number]][] }[] = [
  {
    key: "hats",
    rows: [
      ["caps", [3, 89]],
      ["kids", [90, 99]],
      ["women", [100, 145]],
      ["men", [146, 157]],
      ["panama", [158, 164]],
      ["original", [165, 173]],
    ],
  },
  {
    key: "bags",
    rows: [
      ["straw", [174, 183]],
      ["beach", [184, 199]],
      ["canvas", [200, 241]],
      ["knitted", [242, 267]],
      ["leatherBags", [310, 314]],
      ["wallets", [315, 341]],
    ],
  },
  {
    key: "more",
    rows: [
      ["backpacks", [342, 356]],
      ["stands", [357, 366]],
      ["index", [367, 376]],
    ],
  },
];

/** The whole range as the catalogue's contents page: three columns of two-ended rows. */
export async function RangeList() {
  const t = await getT();
  const range = t.home.range;

  return (
    <section aria-labelledby="range-title" className="mt-36 px-4 sm:px-5 md:mt-52">
      <h2
        id="range-title"
        data-reveal
        className="text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-semibold leading-none tracking-[-0.02em]"
      >
        {range.title}
      </h2>
      <div className="mt-10 grid gap-x-12 gap-y-10 md:mt-14 md:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((group, groupIndex) => (
          <div key={group.key} data-reveal style={{ "--i": groupIndex } as React.CSSProperties}>
            <h3 className="text-base text-muted-foreground">{range[group.key]}</h3>
            <ul className="mt-3">
              {group.rows.map(([key, pages]) => {
                return (
                  <li key={key}>
                    <a
                      href={cataloguePageUrl(DIGITAL_CATALOGUE_URL, pages[0])}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={format(range.opensAt, { page: pages[0] })}
                      className="group flex min-h-11 items-center gap-3 py-1.5 md:min-h-10"
                    >
                      <span className="text-base transition-colors group-hover:text-gold">
                        {range.rows[key]}
                      </span>
                      <span className="ml-auto shrink-0 pl-4 text-sm tabular-nums text-muted-foreground">
                        {pagesLabel(t, pages)}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
