import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import {
  EventBus,
  ID,
  LanguageCode,
  Logger,
  PluginCommonModule,
  ProductEvent,
  ProductService,
  ProductTranslation,
  ProductVariantEvent,
  ProductVariantService,
  ProductVariantTranslation,
  RequestContext,
  TransactionalConnection,
  VendurePlugin,
} from "@vendure/core";
import { filter } from "rxjs/operators";

const loggerCtx = "TranslationSyncPlugin";

/**
 * When a Product or ProductVariant is created or updated, copies its name/slug/description
 * into every language of the active channel that has no (or an empty) translation.
 *
 * Note: since Vendure 3.6 the API itself falls back to another language for missing or empty
 * translated fields, so storefront pages no longer show empty names without this plugin.
 * It is kept so that every channel language has a real, editable translation (e.g. for
 * per-language slugs and search). Copied texts are NOT updated when the source text changes
 * later — edit each language in the Dashboard if the copy should differ.
 */
@Injectable()
class TranslationSyncSubscriber implements OnApplicationBootstrap {
  constructor(
    private eventBus: EventBus,
    private connection: TransactionalConnection,
    private productService: ProductService,
    private productVariantService: ProductVariantService,
  ) {}

  onApplicationBootstrap() {
    // Subscribers run after the publishing transaction has committed, so event.ctx can be used
    // for further writes (see the Vendure "Events" guide).
    this.eventBus
      .ofType(ProductEvent)
      .pipe(filter((event) => event.type !== "deleted"))
      .subscribe(async (event) => {
        try {
          await this.syncProductTranslations(event.ctx, event.entity.id);
        } catch (e: any) {
          Logger.error(`Error syncing translations of product ${event.entity.id}: ${e?.message}`, loggerCtx, e?.stack);
        }
      });

    this.eventBus
      .ofType(ProductVariantEvent)
      .pipe(filter((event) => event.type !== "deleted"))
      .subscribe(async (event) => {
        for (const variant of event.entity) {
          try {
            await this.syncVariantTranslations(event.ctx, variant.id);
          } catch (e: any) {
            Logger.error(`Error syncing translations of variant ${variant.id}: ${e?.message}`, loggerCtx, e?.stack);
          }
        }
      });
  }

  private getChannelLanguages(ctx: RequestContext): LanguageCode[] {
    const { availableLanguageCodes, defaultLanguageCode } = ctx.channel;
    return availableLanguageCodes?.length ? availableLanguageCodes : [defaultLanguageCode];
  }

  private async syncProductTranslations(ctx: RequestContext, productId: ID) {
    const languages = this.getChannelLanguages(ctx);
    if (languages.length <= 1) return;

    const translations = await this.connection
      .getRepository(ctx, ProductTranslation)
      .find({ where: { base: { id: productId } } });

    const source = translations.find((t) => t.name?.trim());
    if (!source) return;

    const missing = languages.filter((lang) => {
      const existing = translations.find((t) => t.languageCode === lang);
      return !existing?.name?.trim();
    });
    if (!missing.length) return;

    await this.productService.update(ctx, {
      id: productId,
      translations: missing.map((languageCode) => ({
        languageCode,
        name: source.name,
        slug: source.slug,
        description: source.description ?? "",
      })),
    });
    Logger.verbose(`Copied product ${productId} texts to ${missing.join(", ")}`, loggerCtx);
  }

  private async syncVariantTranslations(ctx: RequestContext, variantId: ID) {
    const languages = this.getChannelLanguages(ctx);
    if (languages.length <= 1) return;

    const translations = await this.connection
      .getRepository(ctx, ProductVariantTranslation)
      .find({ where: { base: { id: variantId } } });

    const source = translations.find((t) => t.name?.trim());
    if (!source) return;

    const missing = languages.filter((lang) => {
      const existing = translations.find((t) => t.languageCode === lang);
      return !existing?.name?.trim();
    });
    if (!missing.length) return;

    await this.productVariantService.update(ctx, [
      { id: variantId, translations: missing.map((languageCode) => ({ languageCode, name: source.name })) },
    ]);
    Logger.verbose(`Copied variant ${variantId} name to ${missing.join(", ")}`, loggerCtx);
  }
}

/**
 * @description
 * Keeps product & variant translations filled in for every language of the channel.
 * See TranslationSyncSubscriber for details.
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [TranslationSyncSubscriber],
  compatibility: "^3.0.0",
})
export class TranslationSyncPlugin {}
