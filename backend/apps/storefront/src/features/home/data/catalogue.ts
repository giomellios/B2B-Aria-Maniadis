// The 2026 printed catalogue, as the home page uses it: island runs and range runs of real
// product photographs cut from the catalogue pages (public/catalogue/frames), with the printed
// page numbers. `code` matches the Vendure "destination" facet value code, where one exists.

export interface Frame {
  src: string;
  width: number;
  height: number;
}

export interface CatalogueRun {
  code: string;
  name: { en: string; el: string };
  /** First and last printed page in the 2026 catalogue. */
  pages: [number, number];
  frames: Frame[];
}

/** Opens the online flip-book at a printed page (the flip-book counts the cover as page 1). */
export function cataloguePageUrl(baseUrl: string, printedPage: number): string {
  return `${baseUrl}#p=${printedPage + 1}`;
}

export const ISLAND_RUNS: CatalogueRun[] = [
  {
    code: "greece",
    name: { en: "Greece", el: "Ελλάδα" },
    pages: [15, 19],
    frames: [
      { src: "/catalogue/frames/greece-1.jpg", width: 480, height: 431 },
      { src: "/catalogue/frames/greece-2.jpg", width: 480, height: 421 },
      { src: "/catalogue/frames/greece-3.jpg", width: 480, height: 418 },
      { src: "/catalogue/frames/greece-4.jpg", width: 413, height: 480 },
      { src: "/catalogue/frames/greece-5.jpg", width: 405, height: 480 },
      { src: "/catalogue/frames/greece-6.jpg", width: 397, height: 480 },
      { src: "/catalogue/frames/greece-7.jpg", width: 480, height: 350 },
      { src: "/catalogue/frames/greece-8.jpg", width: 480, height: 421 },
    ],
  },
  {
    code: "crete",
    name: { en: "Crete", el: "Κρήτη" },
    pages: [20, 29],
    frames: [
      { src: "/catalogue/frames/crete-1.jpg", width: 480, height: 362 },
      { src: "/catalogue/frames/crete-2.jpg", width: 480, height: 355 },
      { src: "/catalogue/frames/crete-3.jpg", width: 480, height: 447 },
      { src: "/catalogue/frames/crete-4.jpg", width: 480, height: 405 },
      { src: "/catalogue/frames/crete-5.jpg", width: 398, height: 480 },
      { src: "/catalogue/frames/crete-6.jpg", width: 480, height: 416 },
      { src: "/catalogue/frames/crete-7.jpg", width: 480, height: 373 },
      { src: "/catalogue/frames/crete-8.jpg", width: 480, height: 401 },
    ],
  },
  {
    code: "santorini",
    name: { en: "Santorini", el: "Σαντορίνη" },
    pages: [30, 46],
    frames: [
      { src: "/catalogue/frames/santorini-1.jpg", width: 480, height: 417 },
      { src: "/catalogue/frames/santorini-2.jpg", width: 480, height: 406 },
      { src: "/catalogue/frames/santorini-3.jpg", width: 383, height: 480 },
      { src: "/catalogue/frames/santorini-4.jpg", width: 480, height: 408 },
      { src: "/catalogue/frames/santorini-5.jpg", width: 480, height: 403 },
      { src: "/catalogue/frames/santorini-6.jpg", width: 480, height: 480 },
      { src: "/catalogue/frames/santorini-7.jpg", width: 480, height: 390 },
      { src: "/catalogue/frames/santorini-8.jpg", width: 461, height: 480 },
    ],
  },
  {
    code: "mykonos",
    name: { en: "Mykonos", el: "Μύκονος" },
    pages: [47, 59],
    frames: [
      { src: "/catalogue/frames/mykonos-1.jpg", width: 414, height: 480 },
      { src: "/catalogue/frames/mykonos-2.jpg", width: 480, height: 471 },
      { src: "/catalogue/frames/mykonos-3.jpg", width: 480, height: 389 },
      { src: "/catalogue/frames/mykonos-4.jpg", width: 444, height: 480 },
      { src: "/catalogue/frames/mykonos-5.jpg", width: 480, height: 450 },
      { src: "/catalogue/frames/mykonos-6.jpg", width: 464, height: 458 },
      { src: "/catalogue/frames/mykonos-7.jpg", width: 420, height: 480 },
      { src: "/catalogue/frames/mykonos-8.jpg", width: 480, height: 453 },
    ],
  },
  {
    code: "rhodes",
    name: { en: "Rhodes", el: "Ρόδος" },
    pages: [60, 62],
    frames: [
      { src: "/catalogue/frames/rhodes-1.jpg", width: 403, height: 480 },
      { src: "/catalogue/frames/rhodes-2.jpg", width: 429, height: 480 },
      { src: "/catalogue/frames/rhodes-3.jpg", width: 448, height: 480 },
      { src: "/catalogue/frames/rhodes-4.jpg", width: 387, height: 480 },
      { src: "/catalogue/frames/rhodes-5.jpg", width: 480, height: 469 },
      { src: "/catalogue/frames/rhodes-6.jpg", width: 480, height: 454 },
      { src: "/catalogue/frames/rhodes-7.jpg", width: 480, height: 453 },
      { src: "/catalogue/frames/rhodes-8.jpg", width: 480, height: 437 },
    ],
  },
  {
    code: "corfu",
    name: { en: "Corfu", el: "Κέρκυρα" },
    pages: [63, 64],
    frames: [
      { src: "/catalogue/frames/corfu-1.jpg", width: 422, height: 480 },
      { src: "/catalogue/frames/corfu-2.jpg", width: 403, height: 480 },
      { src: "/catalogue/frames/corfu-3.jpg", width: 462, height: 480 },
      { src: "/catalogue/frames/corfu-4.jpg", width: 480, height: 411 },
      { src: "/catalogue/frames/corfu-5.jpg", width: 468, height: 480 },
      { src: "/catalogue/frames/corfu-6.jpg", width: 470, height: 446 },
      { src: "/catalogue/frames/corfu-7.jpg", width: 476, height: 428 },
      { src: "/catalogue/frames/corfu-8.jpg", width: 480, height: 400 },
    ],
  },
  {
    code: "kos",
    name: { en: "Kos", el: "Κως" },
    pages: [66, 70],
    frames: [
      { src: "/catalogue/frames/kos-1.jpg", width: 420, height: 480 },
      { src: "/catalogue/frames/kos-2.jpg", width: 480, height: 468 },
      { src: "/catalogue/frames/kos-3.jpg", width: 472, height: 480 },
      { src: "/catalogue/frames/kos-4.jpg", width: 434, height: 480 },
      { src: "/catalogue/frames/kos-5.jpg", width: 452, height: 356 },
      { src: "/catalogue/frames/kos-6.jpg", width: 480, height: 379 },
      { src: "/catalogue/frames/kos-7.jpg", width: 480, height: 366 },
      { src: "/catalogue/frames/kos-8.jpg", width: 480, height: 377 },
    ],
  },
  {
    code: "naxos",
    name: { en: "Naxos", el: "Νάξος" },
    pages: [71, 71],
    frames: [
      { src: "/catalogue/frames/naxos-1.jpg", width: 480, height: 404 },
      { src: "/catalogue/frames/naxos-2.jpg", width: 480, height: 421 },
      { src: "/catalogue/frames/naxos-3.jpg", width: 480, height: 412 },
      { src: "/catalogue/frames/naxos-4.jpg", width: 480, height: 362 },
      { src: "/catalogue/frames/naxos-5.jpg", width: 480, height: 403 },
      { src: "/catalogue/frames/naxos-6.jpg", width: 480, height: 386 },
      { src: "/catalogue/frames/naxos-7.jpg", width: 480, height: 396 },
    ],
  },
];

export const RANGE_RUNS: CatalogueRun[] = [
  {
    code: "straw-hats",
    name: { en: "Women's straw hats", el: "Γυναικεία ψάθινα καπέλα" },
    pages: [100, 145],
    frames: [
      { src: "/catalogue/frames/straw-hats-1.jpg", width: 480, height: 473 },
      { src: "/catalogue/frames/straw-hats-2.jpg", width: 480, height: 463 },
      { src: "/catalogue/frames/straw-hats-3.jpg", width: 416, height: 308 },
      { src: "/catalogue/frames/straw-hats-4.jpg", width: 480, height: 386 },
      { src: "/catalogue/frames/straw-hats-5.jpg", width: 480, height: 364 },
      { src: "/catalogue/frames/straw-hats-6.jpg", width: 480, height: 377 },
      { src: "/catalogue/frames/straw-hats-7.jpg", width: 480, height: 297 },
      { src: "/catalogue/frames/straw-hats-8.jpg", width: 480, height: 295 },
    ],
  },
  {
    code: "panama",
    name: { en: "Panama & trilby", el: "Panama & καβουράκια" },
    pages: [146, 173],
    frames: [
      { src: "/catalogue/frames/panama-1.jpg", width: 480, height: 303 },
      { src: "/catalogue/frames/panama-2.jpg", width: 480, height: 352 },
      { src: "/catalogue/frames/panama-3.jpg", width: 480, height: 294 },
      { src: "/catalogue/frames/panama-4.jpg", width: 480, height: 321 },
      { src: "/catalogue/frames/panama-5.jpg", width: 480, height: 300 },
      { src: "/catalogue/frames/panama-6.jpg", width: 480, height: 382 },
      { src: "/catalogue/frames/panama-7.jpg", width: 480, height: 299 },
    ],
  },
  {
    code: "bucket",
    name: { en: "Bucket hats", el: "Καπέλα bucket" },
    pages: [77, 89],
    frames: [
      { src: "/catalogue/frames/bucket-1.jpg", width: 480, height: 386 },
      { src: "/catalogue/frames/bucket-2.jpg", width: 480, height: 386 },
      { src: "/catalogue/frames/bucket-3.jpg", width: 480, height: 431 },
      { src: "/catalogue/frames/bucket-4.jpg", width: 480, height: 423 },
      { src: "/catalogue/frames/bucket-5.jpg", width: 480, height: 410 },
      { src: "/catalogue/frames/bucket-6.jpg", width: 480, height: 275 },
      { src: "/catalogue/frames/bucket-7.jpg", width: 456, height: 480 },
      { src: "/catalogue/frames/bucket-8.jpg", width: 467, height: 480 },
    ],
  },
  {
    code: "beach-bags",
    name: { en: "Beach bags", el: "Τσάντες θαλάσσης" },
    pages: [184, 199],
    frames: [
      { src: "/catalogue/frames/beach-bags-1.jpg", width: 388, height: 480 },
      { src: "/catalogue/frames/beach-bags-2.jpg", width: 403, height: 480 },
      { src: "/catalogue/frames/beach-bags-3.jpg", width: 429, height: 480 },
      { src: "/catalogue/frames/beach-bags-4.jpg", width: 349, height: 480 },
      { src: "/catalogue/frames/beach-bags-5.jpg", width: 385, height: 480 },
      { src: "/catalogue/frames/beach-bags-6.jpg", width: 426, height: 480 },
      { src: "/catalogue/frames/beach-bags-7.jpg", width: 412, height: 480 },
      { src: "/catalogue/frames/beach-bags-8.jpg", width: 422, height: 480 },
    ],
  },
  {
    code: "canvas",
    name: { en: "Canvas & island scenes", el: "Τσάντες καμβάς" },
    pages: [200, 241],
    frames: [
      { src: "/catalogue/frames/canvas-1.jpg", width: 288, height: 480 },
      { src: "/catalogue/frames/canvas-2.jpg", width: 418, height: 480 },
      { src: "/catalogue/frames/canvas-3.jpg", width: 385, height: 480 },
      { src: "/catalogue/frames/canvas-4.jpg", width: 303, height: 480 },
      { src: "/catalogue/frames/canvas-5.jpg", width: 392, height: 480 },
      { src: "/catalogue/frames/canvas-6.jpg", width: 385, height: 480 },
      { src: "/catalogue/frames/canvas-7.jpg", width: 314, height: 480 },
      { src: "/catalogue/frames/canvas-8.jpg", width: 313, height: 480 },
      { src: "/catalogue/frames/canvas-9.jpg", width: 314, height: 480 },
      { src: "/catalogue/frames/canvas-10.jpg", width: 317, height: 480 },
    ],
  },
  {
    code: "straw-bags",
    name: { en: "Straw & boho bags", el: "Ψάθινες τσάντες boho" },
    pages: [174, 183],
    frames: [
      { src: "/catalogue/frames/straw-bags-1.jpg", width: 283, height: 480 },
      { src: "/catalogue/frames/straw-bags-2.jpg", width: 380, height: 480 },
      { src: "/catalogue/frames/straw-bags-3.jpg", width: 379, height: 480 },
      { src: "/catalogue/frames/straw-bags-4.jpg", width: 343, height: 480 },
      { src: "/catalogue/frames/straw-bags-5.jpg", width: 294, height: 480 },
      { src: "/catalogue/frames/straw-bags-6.jpg", width: 336, height: 480 },
      { src: "/catalogue/frames/straw-bags-7.jpg", width: 305, height: 480 },
      { src: "/catalogue/frames/straw-bags-8.jpg", width: 317, height: 480 },
    ],
  },
];
