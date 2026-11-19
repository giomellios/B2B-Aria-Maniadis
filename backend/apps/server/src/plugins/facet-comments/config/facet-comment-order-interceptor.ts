import {
  FacetValue,
  ID,
  idsAreEqual,
  Injector,
  LanguageCode,
  Order,
  OrderInterceptor,
  ProductVariant,
  RequestContext,
  TransactionalConnection,
  translateEntity,
  WillAddItemToOrderInput,
  WillAdjustOrderLineInput,
} from "@vendure/core";

import type { CustomFacetValueFieldsTranslation } from "../types";

/**
 * Refuses Shop API order lines whose variant (or its product) carries a facet value that requires
 * a customer comment (FacetValue.customFields.commentRequired) when no comment is given.
 *
 * Only facet values the storefront can see count: public facets, in the current channel. Admin API
 * calls (draft orders, order modification) are not checked — the admin may not have the details.
 */
export class FacetCommentOrderInterceptor implements OrderInterceptor {
  private connection: TransactionalConnection;

  init(injector: Injector) {
    this.connection = injector.get(TransactionalConnection);
  }

  async willAddItemToOrder(
    ctx: RequestContext,
    _order: Order,
    input: WillAddItemToOrderInput
  ): Promise<string | void> {
    return this.check(ctx, input.productVariant.id, input.customFields?.comment);
  }

  async willAdjustOrderLine(
    ctx: RequestContext,
    _order: Order,
    input: WillAdjustOrderLineInput
  ): Promise<string | void> {
    // A plain quantity change keeps the line's comment; only an explicit new comment is checked.
    if (!input.customFields || !("comment" in input.customFields)) {
      return;
    }
    return this.check(ctx, input.orderLine.productVariantId, input.customFields.comment);
  }

  private async check(
    ctx: RequestContext,
    variantId: ID,
    comment: string | null | undefined
  ): Promise<string | void> {
    if (ctx.apiType !== "shop" || comment?.trim()) {
      return;
    }
    const missing = (await this.commentFacetValues(ctx, variantId)).filter(
      (fv) => fv.customFields.commentRequired
    );
    if (missing.length === 0) {
      return;
    }
    const labels = missing.map((fv) => {
      const translated = translateEntity(fv, [ctx.languageCode, ctx.channel.defaultLanguageCode]);
      // translateEntity merges the translation's custom fields (localeString) into customFields.
      const customFields = translated.customFields as typeof translated.customFields &
        CustomFacetValueFieldsTranslation;
      return customFields.commentLabel?.trim() || translated.name;
    });
    return ctx.languageCode === LanguageCode.el
      ? `Συμπληρώστε το σχόλιο «${labels.join(" / ")}» πριν το προσθέσετε στην παραγγελία.`
      : `Please fill in "${labels.join(" / ")}" before adding this item to the order.`;
  }

  /** The comment-enabled facet values of a variant and its product that the shop can see. */
  private async commentFacetValues(ctx: RequestContext, variantId: ID): Promise<FacetValue[]> {
    const facetValueRelations = { facet: true, channels: true, translations: true } as const;
    const variant = await this.connection.getRepository(ctx, ProductVariant).findOne({
      where: { id: variantId },
      relations: {
        facetValues: facetValueRelations,
        product: { facetValues: facetValueRelations },
      },
    });
    if (!variant) {
      return [];
    }
    const all = [...(variant.facetValues ?? []), ...(variant.product?.facetValues ?? [])];
    return all.filter(
      (fv, index) =>
        all.findIndex((other) => idsAreEqual(other.id, fv.id)) === index &&
        fv.customFields?.commentEnabled &&
        !fv.facet?.isPrivate &&
        fv.channels?.some((channel) => idsAreEqual(channel.id, ctx.channelId))
    );
  }
}
