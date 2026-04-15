import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { adminApiExtensions } from './api/api-extensions';
import { AssetVariantMappingResolver } from './api/asset-variant-mapping.resolver';
import { AssetVariantMappingService } from './services/asset-variant-mapping.service';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [AssetVariantMappingService],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [AssetVariantMappingResolver],
    },
    dashboard: './dashboard',
})
export class AssetVariantMappingPlugin {}
