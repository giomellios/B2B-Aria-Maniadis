import { PermissionDefinition } from "@vendure/core";

export const loggerCtx = "CsvImportPlugin";

/** Job queue that runs the imports on the worker process. */
export const CSV_IMPORT_QUEUE = "csv-product-import";

/** Upper bound for an uploaded CSV (the file is stored in the job record until processed). */
export const MAX_CSV_BYTES = 10 * 1024 * 1024;

/**
 * Every imported product gets its OWN option groups: "<prefix><product slug>", e.g. "color-m1204".
 * Option groups list all of their options on the storefront, so a group shared between products
 * would show every product's colours on each product page.
 */
export const COLOR_GROUP_PREFIX = "color-";
export const CHARACTERISTIC_GROUP_PREFIX = "characteristic-";

/**
 * Shared groups that one import (Oct 2026) used by mistake. Still recognised so products that are
 * still attached to them can be updated, but never assigned to new products.
 */
export const LEGACY_SHARED_COLOR_GROUP_CODE = "color";
export const LEGACY_SHARED_CHARACTERISTIC_GROUP_CODE = "characteristic";

/**
 * Required to run the CSV product import. SuperAdmins have it automatically;
 * other administrators need it assigned to one of their Roles (Settings → Roles).
 */
export const importProductsFromCsvPermission = new PermissionDefinition({
  name: "ImportProductsFromCsv",
  description: "Allows importing products from a CSV file",
});
