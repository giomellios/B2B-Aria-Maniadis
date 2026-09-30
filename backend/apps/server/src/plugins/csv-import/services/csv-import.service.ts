import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  CreateProductVariantInput,
  JobState,
  UpdateProductVariantInput,
} from "@vendure/common/lib/generated-types";
import {
  ConfigService,
  ID,
  isInspectableJobQueueStrategy,
  Job,
  JobQueue,
  JobQueueService,
  LanguageCode,
  Logger,
  ProductOptionGroup,
  ProductOptionGroupService,
  ProductOptionService,
  ProductService,
  ProductVariantService,
  RequestContext,
  TaxCategoryService,
  TaxRateService,
  TransactionalConnection,
  Translated,
  UserInputError,
} from "@vendure/core";

import {
  CHARACTERISTIC_GROUP_CODE,
  COLOR_GROUP_CODE,
  CSV_IMPORT_QUEUE,
  loggerCtx,
  MAX_CSV_BYTES,
} from "../constants";
import { cleanForSku, parseCsvBuffer, slugify } from "../csv-parser";
import { CsvImportJobData, CsvRow, ImportResult } from "../types";

export interface CsvImportJobInfo {
  id: ID;
  state: JobState;
  progress: number;
  result: ImportResult | null;
  error: string | null;
}

interface ProductGroup {
  code: string;
  name: string;
  variants: Array<{
    color: string;
    characteristic: string;
    priceWithTax: number;
    quantity: number;
  }>;
}

interface WantedVariant {
  sku: string;
  color: string;
  characteristic: string;
  price: number;
  stockOnHand: number;
}

type Delta = Omit<ImportResult, "errors">;
type PriceConverter = (priceWithTax: number) => number;

interface OptionDimension {
  /** Shared group code used for new products. */
  sharedCode: string;
  /** Prefix of the per-product groups created by earlier versions of this importer. */
  legacyPrefix: string;
  name: { el: string; en: string };
  valueOf: (v: WantedVariant) => string;
}

const DIMENSIONS: OptionDimension[] = [
  {
    sharedCode: COLOR_GROUP_CODE,
    legacyPrefix: "color-",
    name: { el: "Χρώμα", en: "Color" },
    valueOf: (v) => v.color,
  },
  {
    sharedCode: CHARACTERISTIC_GROUP_CODE,
    legacyPrefix: "characteristic-",
    name: { el: "Χαρακτηριστικό", en: "Characteristic" },
    valueOf: (v) => v.characteristic,
  },
];

/**
 * Imports the ERP CSV export into products / variants.
 *
 * - Runs on the worker via the job queue (large files no longer block an HTTP request).
 * - Each product is imported in its own transaction: a failure rolls back that product only
 *   and is reported in `errors`, the rest of the file continues.
 * - Existing products (matched by slug = product code) are updated: price and stock of
 *   variants matched by SKU, and missing variants are added.
 * - New products use the shared "color" / "characteristic" option groups.
 */
@Injectable()
export class CsvImportService implements OnModuleInit {
  private queue: JobQueue<CsvImportJobData>;

  constructor(
    private connection: TransactionalConnection,
    private configService: ConfigService,
    private jobQueueService: JobQueueService,
    private productService: ProductService,
    private productVariantService: ProductVariantService,
    private productOptionGroupService: ProductOptionGroupService,
    private productOptionService: ProductOptionService,
    private taxRateService: TaxRateService,
    private taxCategoryService: TaxCategoryService
  ) {}

  async onModuleInit() {
    this.queue = await this.jobQueueService.createQueue({
      name: CSV_IMPORT_QUEUE,
      process: async (job) => {
        const ctx = RequestContext.deserialize(job.data.ctx);
        const rows = parseCsvBuffer(Buffer.from(job.data.csvBase64, "base64"));
        Logger.info(`Importing ${rows.length} CSV rows from "${job.data.fileName}"`, loggerCtx);
        return this.importRows(ctx, rows, (progress) => job.setProgress(progress));
      },
    });
  }

  async readUpload(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of stream) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
      size += buf.length;
      if (size > MAX_CSV_BYTES) {
        throw new UserInputError(`Το αρχείο ξεπερνά το όριο των ${MAX_CSV_BYTES / 1024 / 1024} MB`);
      }
      chunks.push(buf);
    }
    return Buffer.concat(chunks);
  }

  async startImport(
    ctx: RequestContext,
    buffer: Buffer,
    fileName: string
  ): Promise<CsvImportJobInfo> {
    if (!buffer.length) {
      throw new UserInputError("Το αρχείο είναι κενό");
    }
    const job = await this.queue.add(
      { ctx: ctx.serialize(), fileName, csvBase64: buffer.toString("base64") },
      { retries: 0 }
    );
    return {
      id: job.id as ID,
      state: job.state as JobState,
      progress: job.progress ?? 0,
      result: null,
      error: null,
    };
  }

  async getImportJob(id: ID): Promise<CsvImportJobInfo | undefined> {
    const strategy = this.configService.jobQueueOptions.jobQueueStrategy;
    if (!isInspectableJobQueueStrategy(strategy)) {
      return undefined;
    }
    const job: Job | undefined = await strategy.findOne(id);
    // Only expose jobs of this queue through this query.
    if (!job || job.queueName !== CSV_IMPORT_QUEUE) {
      return undefined;
    }
    return {
      id: job.id as ID,
      state: job.state as JobState,
      progress: job.progress ?? 0,
      result: (job.result as ImportResult | undefined) ?? null,
      error: job.error ? String((job.error as { message?: unknown })?.message ?? job.error) : null,
    };
  }

  async importRows(
    ctx: RequestContext,
    rows: CsvRow[],
    onProgress: (percent: number) => void = () => undefined
  ): Promise<ImportResult> {
    const result: ImportResult = {
      productsCreated: 0,
      productsUpdated: 0,
      variantsCreated: 0,
      variantsUpdated: 0,
      errors: [],
    };
    const groups = groupRowsByProduct(rows);
    const toStoredPrice = await this.getPriceConverter(ctx, result);

    let done = 0;
    for (const group of groups) {
      try {
        const delta = await this.connection.withTransaction(ctx, (txCtx) =>
          this.importProductGroup(txCtx, group, toStoredPrice)
        );
        result.productsCreated += delta.productsCreated;
        result.productsUpdated += delta.productsUpdated;
        result.variantsCreated += delta.variantsCreated;
        result.variantsUpdated += delta.variantsUpdated;
      } catch (err) {
        const msg = `Προϊόν ${group.code}: ${(err as { message?: unknown } | null)?.message ?? err}`;
        Logger.error(msg, loggerCtx);
        result.errors.push(msg);
      }
      done++;
      onProgress(Math.round((done / Math.max(groups.length, 1)) * 100));
    }

    Logger.info(
      `CSV import finished: ${result.productsCreated} products created, ${result.productsUpdated} updated, ` +
        `${result.variantsCreated} variants created, ${result.variantsUpdated} updated, ${result.errors.length} errors`,
      loggerCtx
    );
    return result;
  }

  private async importProductGroup(
    ctx: RequestContext,
    group: ProductGroup,
    toStoredPrice: PriceConverter
  ): Promise<Delta> {
    const delta: Delta = {
      productsCreated: 0,
      productsUpdated: 0,
      variantsCreated: 0,
      variantsUpdated: 0,
    };
    const lang = ctx.languageCode ?? LanguageCode.el;
    const slug = slugify(group.code);
    if (!slug) {
      throw new Error("κενός κωδικός προϊόντος");
    }

    // ---- 1. Find (by slug in any language, current channel) or create the product ----
    let product = await this.productService.findOneBySlug(ctx, slug, ["optionGroups"]);
    if (!product) {
      const created = await this.productService.create(ctx, {
        translations: [{ languageCode: lang, name: group.name, slug, description: "" }],
      });
      product = await this.productService.findOne(ctx, created.id, ["optionGroups"]);
      delta.productsCreated = 1;
    }
    if (!product) {
      throw new Error("το προϊόν δεν βρέθηκε μετά τη δημιουργία");
    }
    const productId = product.id;

    // ---- 2. What the CSV wants for this product ----
    const wanted = toWantedVariants(group, toStoredPrice);

    // ---- 3. Update existing variants (matched by SKU) ----
    const existing = delta.productsCreated
      ? []
      : (await this.productVariantService.getVariantsByProductId(ctx, productId, { take: 1000 }))
          .items;
    const existingBySku = new Map(existing.map((v) => [v.sku, v]));
    const updates: UpdateProductVariantInput[] = [];
    const toCreate: WantedVariant[] = [];
    for (const w of wanted) {
      const match = existingBySku.get(w.sku);
      if (match) {
        updates.push({ id: match.id, price: w.price, stockOnHand: w.stockOnHand });
      } else {
        toCreate.push(w);
      }
    }
    if (updates.length) {
      await this.productVariantService.update(ctx, updates);
      delta.variantsUpdated += updates.length;
    }

    // ---- 4. Create missing variants ----
    if (toCreate.length) {
      const optionGroups = product.optionGroups ?? [];
      const inputs: CreateProductVariantInput[] = [];
      const groupsForDimension = new Map<
        OptionDimension,
        Translated<ProductOptionGroup> | ProductOptionGroup
      >();

      for (const dim of DIMENSIONS) {
        if (!toCreate.some((v) => dim.valueOf(v))) {
          continue;
        }
        let optionGroup = optionGroups.find(
          (g) => g.code === dim.sharedCode || g.code.startsWith(dim.legacyPrefix)
        );
        if (!optionGroup) {
          if (existing.length) {
            throw new Error(
              `υπάρχουν ήδη παραλλαγές χωρίς ομάδα «${dim.name.el}» — διαγράψτε το προϊόν και εισάγετέ το ξανά`
            );
          }
          optionGroup = await this.getOrCreateSharedGroup(ctx, dim);
          await this.productService.addOptionGroupToProduct(ctx, productId, optionGroup.id);
        }
        groupsForDimension.set(dim, optionGroup);
      }

      // Every option group of the product needs a value for each new variant.
      const unknownGroups = optionGroups.filter(
        (g) => ![...groupsForDimension.values()].some((used) => used.id === g.id)
      );
      if (unknownGroups.length && existing.length) {
        throw new Error(
          `το προϊόν έχει επιπλέον ομάδες επιλογών (${unknownGroups.map((g) => g.code).join(", ")}) που δεν υπάρχουν στο CSV`
        );
      }

      const optionIdsByGroup = new Map<ID, Map<string, ID>>();
      for (const [dim, optionGroup] of groupsForDimension) {
        const codeToId = await this.loadOptionCodes(ctx, optionGroup.id);
        for (const v of toCreate) {
          const value = dim.valueOf(v);
          const code = cleanForSku(value);
          if (!value || !code || codeToId.has(code)) {
            continue;
          }
          const option = await this.productOptionService.create(ctx, optionGroup.id, {
            code,
            translations: [{ languageCode: lang, name: value }],
          });
          codeToId.set(code, option.id);
        }
        optionIdsByGroup.set(optionGroup.id, codeToId);
      }

      for (const v of toCreate) {
        const optionIds: ID[] = [];
        for (const [dim, optionGroup] of groupsForDimension) {
          const id = optionIdsByGroup.get(optionGroup.id)?.get(cleanForSku(dim.valueOf(v)));
          if (id != null) {
            optionIds.push(id);
          }
        }
        if (optionIds.length !== groupsForDimension.size) {
          Logger.warn(
            `Skipping variant ${v.sku} of ${group.code}: missing color/characteristic value`,
            loggerCtx
          );
          continue;
        }
        inputs.push({
          productId,
          sku: v.sku,
          price: v.price,
          stockOnHand: v.stockOnHand,
          optionIds,
          translations: [
            { languageCode: lang, name: `${group.name} - ${v.color} ${v.characteristic}`.trim() },
          ],
        });
      }
      if (inputs.length) {
        const created = await this.productVariantService.create(ctx, inputs);
        delta.variantsCreated += created.length;
      }
    }

    if (!delta.productsCreated && (delta.variantsCreated || delta.variantsUpdated)) {
      delta.productsUpdated = 1;
    }
    return delta;
  }

  private async getOrCreateSharedGroup(
    ctx: RequestContext,
    dim: OptionDimension
  ): Promise<Translated<ProductOptionGroup> | ProductOptionGroup> {
    const found = await this.productOptionGroupService.findAll(ctx, {
      filter: { code: { eq: dim.sharedCode } },
      take: 1,
    });
    if (found.items[0]) {
      return found.items[0];
    }
    return this.productOptionGroupService.create(ctx, {
      code: dim.sharedCode,
      translations: [
        { languageCode: LanguageCode.el, name: dim.name.el },
        { languageCode: LanguageCode.en, name: dim.name.en },
      ],
    });
  }

  private async loadOptionCodes(ctx: RequestContext, groupId: ID): Promise<Map<string, ID>> {
    const options = await this.productOptionService.findAll(ctx, { take: 1000 }, groupId);
    return new Map(options.items.map((o) => [o.code, o.id]));
  }

  /**
   * The CSV contains prices WITH tax. Vendure stores variant prices as entered, interpreted according
   * to the channel's "prices include tax" setting — so convert to net prices when that setting is off.
   */
  private async getPriceConverter(
    ctx: RequestContext,
    result: ImportResult
  ): Promise<PriceConverter> {
    if (ctx.channel.pricesIncludeTax) {
      return (gross) => gross;
    }
    const zoneId = ctx.channel.defaultTaxZone?.id;
    const taxCategory = (await this.taxCategoryService.findAll(ctx)).items.find((c) => c.isDefault);
    if (!zoneId || !taxCategory) {
      result.errors.push(
        "Το κανάλι δεν έχει προεπιλεγμένη ζώνη φόρου ή κατηγορία φόρου — οι τιμές αποθηκεύτηκαν όπως είναι στο CSV."
      );
      return (gross) => gross;
    }
    const taxRate = await this.taxRateService.getApplicableTaxRate(ctx, zoneId, taxCategory);
    return (gross) => Math.round(taxRate.netPriceOf(gross));
  }
}

function groupRowsByProduct(rows: CsvRow[]): ProductGroup[] {
  const groupMap = new Map<string, ProductGroup>();
  for (const row of rows) {
    let group = groupMap.get(row.code);
    if (!group) {
      group = { code: row.code, name: row.name, variants: [] };
      groupMap.set(row.code, group);
    }
    group.variants.push({
      color: row.color,
      characteristic: row.characteristic,
      priceWithTax: row.priceWithTax,
      quantity: row.quantity,
    });
  }
  return [...groupMap.values()];
}

/** One entry per distinct color+characteristic (first CSV row wins). SKU format is unchanged from earlier imports. */
function toWantedVariants(group: ProductGroup, toStoredPrice: PriceConverter): WantedVariant[] {
  const seen = new Set<string>();
  const wanted: WantedVariant[] = [];
  group.variants.forEach((v, idx) => {
    const key = `${cleanForSku(v.color)}|${cleanForSku(v.characteristic)}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    const sku = [
      group.code,
      cleanForSku(v.color) || `v${idx}`,
      cleanForSku(v.characteristic) || `c${idx}`,
    ]
      .join("-")
      .substring(0, 100);
    wanted.push({
      sku,
      color: v.color,
      characteristic: v.characteristic,
      price: toStoredPrice(v.priceWithTax),
      stockOnHand: v.quantity,
    });
  });
  return wanted;
}
