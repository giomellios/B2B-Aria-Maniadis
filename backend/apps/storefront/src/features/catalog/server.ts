import "server-only";

// Server-only public API of the catalog feature: data loaders and
// async server components. Import from server components / pages only.
export { CollectionHeader } from "@/features/catalog/components/collection-header";
export { ProductGrid } from "@/features/catalog/components/product-grid";
export { RelatedProducts } from "@/features/catalog/components/related-products";
export { SearchResults } from "@/features/catalog/components/search-results";
export {
  getCollectionMetadata,
  getCollectionProducts,
  getProductData,
} from "@/features/catalog/services/catalog.service";
export { SearchProductsQuery } from "@/features/catalog/services/queries";
