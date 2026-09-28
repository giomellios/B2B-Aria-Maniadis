import { PermissionDefinition } from '@vendure/core';

/**
 * Required to run the CSV product import. SuperAdmins have it automatically;
 * other administrators need it assigned to one of their Roles (Settings → Roles).
 */
export const importProductsFromCsvPermission = new PermissionDefinition({
    name: 'ImportProductsFromCsv',
    description: 'Allows importing products from a CSV file',
});
