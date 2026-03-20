import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { adminApiExtensions } from './api/api-extensions';
import { CsvImportResolver } from './api/csv-import.resolver';
import { CsvImportService } from './services/csv-import.service';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [CsvImportService],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [CsvImportResolver],
    },
    dashboard: './dashboard',
})
export class CsvImportPlugin {}
