import {
  Injector,
  LanguageCode,
  OrderProcess,
  OrderState,
  ShippingLine,
  TransactionalConnection,
} from "@vendure/core";

import "../types";

let connection: TransactionalConnection;

/**
 * Refuses to move a Shop API order to ArrangingPayment when its shipping method requires the
 * customer's own carrier (ShippingMethod.customFields.requiresCarrierDetails) and the order has
 * no Order.customFields.carrierDetails.
 */
export const carrierDetailsOrderProcess: OrderProcess<OrderState> = {
  init(injector: Injector) {
    connection = injector.get(TransactionalConnection);
  },

  async onTransitionStart(_fromState, toState, { ctx, order }) {
    if (toState !== "ArrangingPayment" || ctx.apiType !== "shop") {
      return;
    }
    if (order.customFields?.carrierDetails?.trim()) {
      return;
    }
    const shippingLines = await connection.getRepository(ctx, ShippingLine).find({
      where: { order: { id: order.id } },
      relations: { shippingMethod: true },
    });
    if (shippingLines.some((line) => line.shippingMethod?.customFields?.requiresCarrierDetails)) {
      return ctx.languageCode === LanguageCode.el
        ? "Συμπληρώστε τη μεταφορική εταιρεία που θα παραλάβει την παραγγελία."
        : "Please fill in the transport company that will collect the order.";
    }
  },
};
