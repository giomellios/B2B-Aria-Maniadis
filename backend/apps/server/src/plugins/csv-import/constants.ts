import { PermissionDefinition } from '@vendure/core';

export const loggerCtx = 'CsvImportPlugin';

/** Job queue that runs the imports on the worker process. */
export const CSV_IMPORT_QUEUE = 'csv-product-import';

/** Upper bound for an uploaded CSV (the file is stored in the job record until processed). */
export const MAX_CSV_BYTES = 10 * 1024 * 1024;

/**
 * Shared (since Vendure 3.6) option groups used by all imported products.
 * Products imported before this change keep their own per-product groups
 * ("color-<code>", "characteristic-<code>"), which the importer still recognises.
 */
export const COLOR_GROUP_CODE = 'color';
export const CHARACTERISTIC_GROUP_CODE = 'characteristic';

/**
 * Required to run the CSV product import. SuperAdmins have it automatically;
 * other administrators need it assigned to one of their Roles (Settings → Roles).
 */
export const importProductsFromCsvPermission = new PermissionDefinition({
    name: 'ImportProductsFromCsv',
    description: 'Allows importing products from a CSV file',
});
