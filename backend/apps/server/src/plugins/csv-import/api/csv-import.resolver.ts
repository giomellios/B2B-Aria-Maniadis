import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Allow, Ctx, ID, RequestContext } from "@vendure/core";

import { importProductsFromCsvPermission } from "../constants";
import { CsvImportJobInfo, CsvImportService } from "../services/csv-import.service";

interface FileUpload {
  filename: string;
  mimetype: string;
  createReadStream(): NodeJS.ReadableStream;
}

@Resolver()
export class CsvImportResolver {
  constructor(private readonly csvImportService: CsvImportService) {}

  @Mutation()
  @Allow(importProductsFromCsvPermission.Permission)
  async startCsvProductImport(
    @Ctx() ctx: RequestContext,
    @Args() args: { file: Promise<FileUpload> }
  ): Promise<CsvImportJobInfo> {
    const upload = await args.file;
    const buffer = await this.csvImportService.readUpload(upload.createReadStream());
    return this.csvImportService.startImport(ctx, buffer, upload.filename);
  }

  @Query()
  @Allow(importProductsFromCsvPermission.Permission)
  csvProductImportJob(@Args() args: { id: ID }): Promise<CsvImportJobInfo | undefined> {
    return this.csvImportService.getImportJob(args.id);
  }
}
