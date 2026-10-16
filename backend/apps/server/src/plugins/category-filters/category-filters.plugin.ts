import { PluginCommonModule, VendurePlugin } from "@vendure/core";

import { productNameCollectionFilter } from "./product-name-collection-filter";

/**
 * Extra rules for filling categories (Collections) automatically — see
 * product-name-collection-filter.ts. In the Dashboard: Catalog › Collections › Filters.
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  configuration: (config) => {
    config.catalogOptions.collectionFilters.push(productNameCollectionFilter);
    return config;
  },
  compatibility: "^3.0.0",
})
export class CategoryFiltersPlugin {}
