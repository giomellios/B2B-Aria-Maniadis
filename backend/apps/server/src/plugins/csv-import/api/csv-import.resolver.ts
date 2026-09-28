import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, RequestContext } from '@vendure/core';
import { importProductsFromCsvPermission } from '../constants';
import { CsvImportService } from '../services/csv-import.service';
import { ImportResult } from '../types';

@Resolver()
export class CsvImportResolver {
    constructor(private readonly csvImportService: CsvImportService) {}

    @Mutation()
    // Previously Permission.Authenticated, which every logged-in *customer* also has.
    @Allow(importProductsFromCsvPermission.Permission)
    async importProductsFromCsv(
        @Ctx() ctx: RequestContext,
        @Args() args: { csvBase64: string },
    ): Promise<ImportResult> {
        const buffer = Buffer.from(args.csvBase64, 'base64');
        return this.csvImportService.importFromBuffer(ctx, buffer);
    }
}
