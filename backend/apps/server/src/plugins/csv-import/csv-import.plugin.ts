import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { adminApiExtensions } from './api/api-extensions';
import { CsvImportResolver } from './api/csv-import.resolver';
import { CsvImportService } from './services/csv-import.service';
import { importProductsFromCsvPermission } from './constants';

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
