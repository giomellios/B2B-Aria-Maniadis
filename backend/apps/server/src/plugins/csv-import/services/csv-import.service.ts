import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  CreateProductVariantInput,
  JobState,
  UpdateProductVariantInput,
} from "@vendure/common/lib/generated-types";
import {
  ConfigService,
  Facet,
  FacetService,
  FacetValueService,
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
  CHARACTERISTIC_FACET_CODE,
  CHARACTERISTIC_GROUP_PREFIX,
  COLOR_FACET_CODE,
  COLOR_GROUP_PREFIX,
  CSV_IMPORT_QUEUE,
  DESTINATION_FACET_CODE,
  LEGACY_SHARED_CHARACTERISTIC_GROUP_CODE,
  LEGACY_SHARED_COLOR_GROUP_CODE,
  loggerCtx,
  MAX_CSV_BYTES,
} from "../constants";
import { cleanForSku, parseCsvBuffer, slugify } from "../csv-parser";
import { detectDestinations } from "../destinations";
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
  /** Prefix of the product's own group: "<prefix><product slug>". */
  prefix: string;
  /** Shared group code from the Oct 2026 import — only recognised, never assigned. */
  legacySharedCode: string;
  name: { el: string; en: string };
  /** Shared facet (storefront search filter) that mirrors this option, see constants.ts. */
  facetCode: string;
  facetName: { el: string; en: string };
  valueOf: (v: WantedVariant) => string;
}

const DIMENSIONS: OptionDimension[] = [
  {
    prefix: COLOR_GROUP_PREFIX,
    legacySharedCode: LEGACY_SHARED_COLOR_GROUP_CODE,
    name: { el: "Χρώμα", en: "Color" },
    facetCode: COLOR_FACET_CODE,
    facetName: { el: "Χρώμα", en: "Colour" },
    valueOf: (v) => v.color,
  },
  {
    prefix: CHARACTERISTIC_GROUP_PREFIX,
    legacySharedCode: LEGACY_SHARED_CHARACTERISTIC_GROUP_CODE,
    name: { el: "Χαρακτηριστικό", en: "Characteristic" },
    facetCode: CHARACTERISTIC_FACET_CODE,
    facetName: { el: "Χαρακτηριστικό", en: "Characteristic" },
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
 * - Every product gets its own "color-<slug>" / "characteristic-<slug>" option groups (never
 *   shared: the storefront lists all options of a product's groups).
 * - Every variant is also tagged with values of the shared "color" / "characteristic" facets, and
 *   the product with its "destination" (read from the name) — the storefront's search filters.
 *   Re-importing a file back-fills the tags on existing products.
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
    private taxCategoryService: TaxCategoryService,
    private facetService: FacetService,
    private facetValueService: FacetValueService
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
          (g) => g.code.startsWith(dim.prefix) || g.code === dim.legacySharedCode
        );
        if (!optionGroup) {
          if (existing.length) {
            throw new Error(
              `υπάρχουν ήδη παραλλαγές χωρίς ομάδα «${dim.name.el}» — διαγράψτε το προϊόν και εισάγετέ το ξανά`
            );
          }
          optionGroup = await this.createProductGroup(ctx, dim, slug);
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

    // ---- 5. Tag the variants with the shared colour / characteristic facets, the product with
    //         its destination ----
    await this.assignOptionFacetValues(ctx, productId, wanted);
    await this.assignDestinationFacetValues(ctx, productId, group.name);

    if (!delta.productsCreated && (delta.variantsCreated || delta.variantsUpdated)) {
      delta.productsUpdated = 1;
    }
    return delta;
  }

  private async createProductGroup(
    ctx: RequestContext,
    dim: OptionDimension,
    productSlug: string
  ): Promise<Translated<ProductOptionGroup> | ProductOptionGroup> {
    return this.productOptionGroupService.create(ctx, {
      code: `${dim.prefix}${productSlug}`,
      translations: [
        { languageCode: LanguageCode.el, name: dim.name.el },
        { languageCode: LanguageCode.en, name: dim.name.en },
      ],
    });
  }

  /**
   * Gives each variant exactly one value of each dimension's facet (matched by SKU), keeping any
   * other facet values an admin assigned by hand. Variants already tagged correctly are skipped.
   */
  private async assignOptionFacetValues(
    ctx: RequestContext,
    productId: ID,
    wanted: WantedVariant[]
  ): Promise<void> {
    const wantedBySku = new Map(wanted.map((w) => [w.sku, w]));
    const valueIdsByDimension = new Map<OptionDimension, Map<string, ID>>();
    for (const dim of DIMENSIONS) {
      const values = wanted.map((w) => {
        const name = dim.valueOf(w).trim();
        return { code: facetValueCode(name), name: { el: name, en: name } };
      });
      valueIdsByDimension.set(
        dim,
        await this.ensureFacetValues(ctx, { code: dim.facetCode, name: dim.facetName }, values)
      );
    }
    const facetCodes = new Set(DIMENSIONS.map((dim) => dim.facetCode));
    const variants = (
      await this.productVariantService.getVariantsByProductId(ctx, productId, { take: 1000 }, [
        "facetValues",
        "facetValues.facet",
      ])
    ).items;

    const updates: UpdateProductVariantInput[] = [];
    for (const variant of variants) {
      const w = wantedBySku.get(variant.sku);
      if (!w) {
        continue;
      }
      const tagIds: ID[] = [];
      for (const [dim, idByCode] of valueIdsByDimension) {
        const id = idByCode.get(facetValueCode(dim.valueOf(w)));
        if (id != null) {
          tagIds.push(id);
        }
      }
      const current = variant.facetValues ?? [];
      const currentTagIds = current
        .filter((fv) => facetCodes.has(fv.facet?.code))
        .map((fv) => String(fv.id));
      if (
        currentTagIds.length === tagIds.length &&
        tagIds.every((id) => currentTagIds.includes(String(id)))
      ) {
        continue;
      }
      const others = current.filter((fv) => !facetCodes.has(fv.facet?.code)).map((fv) => fv.id);
      updates.push({ id: variant.id, facetValueIds: [...others, ...tagIds] });
    }
    if (updates.length) {
      await this.productVariantService.update(ctx, updates);
    }
  }

  /** Finds or creates a facet and the given values (matched by code). Returns value ids by code. */
  private async ensureFacetValues(
    ctx: RequestContext,
    facetDef: { code: string; name: { el: string; en: string } },
    values: Array<{ code: string; name: { el: string; en: string } }>
  ): Promise<Map<string, ID>> {
    let facet: Facet | undefined = await this.facetService.findByCode(
      ctx,
      facetDef.code,
      LanguageCode.el
    );
    if (!facet) {
      facet = await this.facetService.create(ctx, {
        code: facetDef.code,
        isPrivate: false,
        translations: [
          { languageCode: LanguageCode.el, name: facetDef.name.el },
          { languageCode: LanguageCode.en, name: facetDef.name.en },
        ],
      });
    }
    const idByCode = new Map<string, ID>((facet.values ?? []).map((fv) => [fv.code, fv.id]));
    for (const value of values) {
      if (!value.code || idByCode.has(value.code)) {
        continue;
      }
      const created = await this.facetValueService.create(ctx, facet, {
        code: value.code,
        translations: [
          { languageCode: LanguageCode.el, name: value.name.el },
          { languageCode: LanguageCode.en, name: value.name.en },
        ],
      });
      idByCode.set(value.code, created.id);
    }
    return idByCode;
  }

  /**
   * Tags the product with the shared "destination" facet, detected from its name (see
   * destinations.ts). Other facet values on the product are kept.
   */
  private async assignDestinationFacetValues(
    ctx: RequestContext,
    productId: ID,
    productName: string
  ): Promise<void> {
    const destinations = detectDestinations(productName);
    const idByCode = destinations.length
      ? await this.ensureFacetValues(
          ctx,
          { code: DESTINATION_FACET_CODE, name: { el: "Προορισμός", en: "Destination" } },
          destinations
        )
      : new Map<string, ID>();
    const tagIds = destinations
      .map((d) => idByCode.get(d.code))
      .filter((id): id is ID => id != null);

    const product = await this.productService.findOne(ctx, productId, [
      "facetValues",
      "facetValues.facet",
    ]);
    const current = product?.facetValues ?? [];
    const currentTagIds = current
      .filter((fv) => fv.facet?.code === DESTINATION_FACET_CODE)
      .map((fv) => String(fv.id));
    if (
      currentTagIds.length === tagIds.length &&
      tagIds.every((id) => currentTagIds.includes(String(id)))
    ) {
      return;
    }
    const others = current
      .filter((fv) => fv.facet?.code !== DESTINATION_FACET_CODE)
      .map((fv) => fv.id);
    await this.productService.update(ctx, { id: productId, facetValueIds: [...others, ...tagIds] });
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

/** Case-insensitive, so "ΜΑΥΡΟ" and "Μαυρο" share one filter value. */
function facetValueCode(value: string): string {
  return cleanForSku(value).toLocaleLowerCase("el");
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
