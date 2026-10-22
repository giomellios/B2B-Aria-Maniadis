// The 2026 printed catalogue, as the home page uses it: the islands it is ordered by, with their
// printed page numbers. `code` matches the Vendure "destination" facet value code, where one exists.

export interface CatalogueRun {
  code: string;
  name: { en: string; el: string };
  /** First and last printed page in the 2026 catalogue. */
  pages: [number, number];
}

/** Opens the online flip-book at a printed page (the flip-book counts the cover as page 1). */
export function cataloguePageUrl(baseUrl: string, printedPage: number): string {
  return `${baseUrl}#p=${printedPage + 1}`;
}

export const ISLAND_RUNS: CatalogueRun[] = [
  { code: "greece", name: { en: "Greece", el: "Ελλάδα" }, pages: [15, 19] },
  { code: "crete", name: { en: "Crete", el: "Κρήτη" }, pages: [20, 29] },
  { code: "santorini", name: { en: "Santorini", el: "Σαντορίνη" }, pages: [30, 46] },
  { code: "mykonos", name: { en: "Mykonos", el: "Μύκονος" }, pages: [47, 59] },
  { code: "rhodes", name: { en: "Rhodes", el: "Ρόδος" }, pages: [60, 62] },
  { code: "corfu", name: { en: "Corfu", el: "Κέρκυρα" }, pages: [63, 64] },
  { code: "kos", name: { en: "Kos", el: "Κως" }, pages: [66, 70] },
  { code: "naxos", name: { en: "Naxos", el: "Νάξος" }, pages: [71, 71] },
];
