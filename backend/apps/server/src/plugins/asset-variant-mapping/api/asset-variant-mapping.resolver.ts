import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, Permission, RequestContext } from '@vendure/core';
import { AssetVariantMappingService } from '../services/asset-variant-mapping.service';
import { AssetVariantMappingResult } from '../types';

@Resolver()
export class AssetVariantMappingResolver {
    constructor(private readonly mappingService: AssetVariantMappingService) {}

    @Mutation()
    @Allow(Permission.UpdateCatalog)
    async mapAssetsToVariantsByFilename(
        @Ctx() ctx: RequestContext,
        @Args() args: { assetIds: string[] },
    ): Promise<AssetVariantMappingResult> {
        return this.mappingService.mapAssetsToVariantsByFilename(ctx, args.assetIds);
    }
}
