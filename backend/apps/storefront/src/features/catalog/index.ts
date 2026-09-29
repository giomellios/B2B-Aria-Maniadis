// Public, client-safe API of the catalog feature.
// Server-only exports (data loaders, async server components) live in ./server.ts.
export { FacetFilters } from "@/features/catalog/components/facet-filters";
export { ProductCarousel } from "@/features/catalog/components/product-carousel";
export { ProductGridSkeleton } from "@/features/catalog/components/product-grid-skeleton";
export { ProductImageCarousel } from "@/features/catalog/components/product-image-carousel";
export { ProductInfo } from "@/features/catalog/components/product-info";
export { SearchResultsSkeleton } from "@/features/catalog/components/search-results-skeleton";
export { SearchTerm, SearchTermSkeleton } from "@/features/catalog/components/search-term";
export { getCurrentPage } from "@/features/catalog/utils/search-helpers";
