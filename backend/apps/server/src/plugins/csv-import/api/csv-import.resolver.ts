import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, Permission, RequestContext } from '@vendure/core';
import { CsvImportService } from '../services/csv-import.service';
import { ImportResult } from '../types';

@Resolver()
export class CsvImportResolver {
    constructor(private readonly csvImportService: CsvImportService) {}

    @Mutation()
    @Allow(Permission.Authenticated)
    async importProductsFromCsv(
        @Ctx() ctx: RequestContext,
        @Args() args: { csvBase64: string },
    ): Promise<ImportResult> {
        const buffer = Buffer.from(args.csvBase64, 'base64');
        return this.csvImportService.importFromBuffer(ctx, buffer);
    }
}
