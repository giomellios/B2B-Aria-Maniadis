import { PluginCommonModule, VendurePlugin } from '@vendure/core';

import { adminApiExtensions } from './api/api-extensions';
import { CsvImportResolver } from './api/csv-import.resolver';
import { importProductsFromCsvPermission } from './constants';
import { CsvImportService } from './services/csv-import.service';

/**
 * Product import from the ERP's CSV export (Dashboard: Catalog › CSV).
 * The upload is queued and processed on the worker — the worker must be running.
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [CsvImportService],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [CsvImportResolver],
    },
    configuration: config => {
        config.authOptions.customPermissions.push(importProductsFromCsvPermission);
        return config;
    },
    dashboard: './dashboard',
    compatibility: '^3.0.0',
})
export class CsvImportPlugin {}
