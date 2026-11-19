import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import {
  Ctx,
  Order,
  OrderService,
  RequestContext,
  ShippingLine,
  TransactionalConnection,
  translateEntity,
} from "@vendure/core";

import { TRACKING_CODE_PLACEHOLDER } from "../constants";
import "../types";

export interface OrderTracking {
  trackingNumber: string;
  carrier: string | null;
  url: string | null;
  urlIncludesNumber: boolean;
}

/**
 * Shop API `Order.tracking`. The Order itself is only reachable through queries that already check
 * the customer owns it (activeOrder, orderByCode, activeCustomer.orders), so this field adds no access.
 * Order.customFields.trackingNumber is admin-only (not public); this is the read-only view of it.
 */
@Resolver("Order")
export class OrderTrackingShopResolver {
  constructor(
    private connection: TransactionalConnection,
    private orderService: OrderService
  ) {}

  @ResolveField()
  async tracking(
    @Ctx() ctx: RequestContext,
    @Parent() order: Order
  ): Promise<OrderTracking | null> {
    const trackingNumber =
      order.customFields?.trackingNumber?.trim() ||
      (await this.fulfillmentTrackingCode(ctx, order));
    if (!trackingNumber) {
      return null;
    }

    const shippingLine = await this.connection.getRepository(ctx, ShippingLine).findOne({
      where: { order: { id: order.id } },
      relations: { shippingMethod: { translations: true } },
      order: { id: "ASC" },
    });
    const method = shippingLine?.shippingMethod
      ? translateEntity(shippingLine.shippingMethod, [
          ctx.languageCode,
          ctx.channel.defaultLanguageCode,
        ])
      : undefined;

    const template = method?.customFields?.trackingUrl?.trim() || null;
    const urlIncludesNumber = Boolean(template?.includes(TRACKING_CODE_PLACEHOLDER));
    return {
      trackingNumber,
      carrier: method?.name || null,
      url: template
        ? template.split(TRACKING_CODE_PLACEHOLDER).join(encodeURIComponent(trackingNumber))
        : null,
      urlIncludesNumber,
    };
  }

  /** A tracking code entered through Vendure's own "Fulfil order" dialog, if there is one. */
  private async fulfillmentTrackingCode(ctx: RequestContext, order: Order): Promise<string | null> {
    const fulfillments = await this.orderService.getOrderFulfillments(ctx, order);
    return (
      fulfillments.map((f) => f.trackingCode?.trim()).find((code): code is string => !!code) ?? null
    );
  }
}
