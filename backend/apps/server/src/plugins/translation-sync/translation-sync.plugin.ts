import {
  EventBus,
  LanguageCode,
  PluginCommonModule,
  ProductEvent,
  ProductVariantEvent,
  TransactionalConnection,
  VendurePlugin,
  ChannelService,
  ProductService,
  ProductVariantService,
  RequestContext,
} from "@vendure/core";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";

/**
 * When a Product or ProductVariant is created or updated, this subscriber
 * copies its translations to every language available on the active channel
 * so that the storefront never receives empty name/slug fields regardless
 * of which language the admin happened to be using.
 */
@Injectable()
class TranslationSyncSubscriber implements OnApplicationBootstrap {
  constructor(
    private eventBus: EventBus,
    private connection: TransactionalConnection,
    private channelService: ChannelService,
    private productService: ProductService,
    private productVariantService: ProductVariantService,
  ) {}

  onApplicationBootstrap() {
    // --- Product: created or updated ---
    this.eventBus.ofType(ProductEvent).subscribe(async (event) => {
      if (event.type === "deleted") return;
      try {
        await this.syncProductTranslations(event.ctx, event.entity.id);
      } catch (e) {
        console.error("[TranslationSyncPlugin] Error syncing product translations:", e);
      }
    });

    // --- ProductVariant: created or updated ---
    this.eventBus.ofType(ProductVariantEvent).subscribe(async (event) => {
      if (event.type === "deleted") return;
      try {
        for (const variant of event.entity) {
          await this.syncVariantTranslations(event.ctx, variant.id);
        }
      } catch (e) {
        console.error("[TranslationSyncPlugin] Error syncing variant translations:", e);
      }
    });
  }

  /**
   * Get all available language codes for the active channel.
   */
  private async getChannelLanguages(ctx: RequestContext): Promise<LanguageCode[]> {
    const channel = await this.channelService.getChannelFromToken(ctx.channel.token);
    return channel.availableLanguageCodes ?? [channel.defaultLanguageCode];
  }

  /**
   * For a given product, find the "source" translation (the first non-empty one)
   * and copy its name/slug/description to every language that is missing them.
   */
  private async syncProductTranslations(ctx: RequestContext, productId: number | string) {
    const languages = await this.getChannelLanguages(ctx);
    if (languages.length <= 1) return;

    // Fetch product with all translations using raw repo
    const product = await this.connection.rawConnection
      .getRepository("ProductTranslation")
      .find({ where: { base: { id: productId } } }) as Array<{
        id: number;
        languageCode: LanguageCode;
        name: string;
        slug: string;
        description: string;
      }>;

    // Find the source: the first translation that has a non-empty name
    const source = product.find((t) => t.name && t.name.trim() !== "");
    if (!source) return; // nothing to copy from

    // Build translations array: fill in any missing languages
    const existingLangs = new Set(product.map((t) => t.languageCode));
    const translationsToSet: Array<{
      languageCode: LanguageCode;
      name: string;
      slug: string;
      description: string;
    }> = [];

    for (const lang of languages) {
      const existing = product.find((t) => t.languageCode === lang);
      if (!existing || !existing.name || existing.name.trim() === "") {
        translationsToSet.push({
          languageCode: lang,
          name: source.name,
          slug: source.slug,
          description: source.description ?? "",
        });
      }
    }

    if (translationsToSet.length === 0) return;

    // Use ProductService.update to save the missing translations
    await this.productService.update(ctx, {
      id: productId,
      translations: translationsToSet,
    });
  }

  /**
   * For a given variant, find the source translation and copy to missing languages.
   */
  private async syncVariantTranslations(ctx: RequestContext, variantId: number | string) {
    const languages = await this.getChannelLanguages(ctx);
    if (languages.length <= 1) return;

    const translations = await this.connection.rawConnection
      .getRepository("ProductVariantTranslation")
      .find({ where: { base: { id: variantId } } }) as Array<{
        id: number;
        languageCode: LanguageCode;
        name: string;
      }>;

    const source = translations.find((t) => t.name && t.name.trim() !== "");
    if (!source) return;

    const translationsToSet: Array<{ languageCode: LanguageCode; name: string }> = [];

    for (const lang of languages) {
      const existing = translations.find((t) => t.languageCode === lang);
      if (!existing || !existing.name || existing.name.trim() === "") {
        translationsToSet.push({
          languageCode: lang,
          name: source.name,
        });
      }
    }

    if (translationsToSet.length === 0) return;

    // ProductVariantService.update takes an array of UpdateProductVariantInput
    // We need one entry per language we're adding, but they all point to the same variant
    await this.productVariantService.update(
      ctx,
      [{ id: variantId, translations: translationsToSet }],
    );
  }
}

/**
 * @description
 * Automatically syncs product & variant translations across all available
 * channel languages. When an admin creates or updates a product in any language,
 * the name/slug/description are copied to all other languages that have empty values.
 *
 * This prevents the common issue where a product is entered in one language
 * but appears empty in the storefront because the storefront queries in the
 * channel's default language.
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [TranslationSyncSubscriber],
})
export class TranslationSyncPlugin {}
