// Public, client-safe API of the home feature.
// Server-only exports (data loaders, async server components) live in ./server.ts.
export { ISLAND_RUNS, RANGE_RUNS, cataloguePageUrl } from "@/features/home/data/catalogue";
export type { CatalogueRun, Frame } from "@/features/home/data/catalogue";
