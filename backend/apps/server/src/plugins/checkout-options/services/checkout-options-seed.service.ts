import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import {
  defaultShippingCalculator,
  defaultShippingEligibilityChecker,
  Logger,
  manualFulfillmentHandler,
  PaymentMethod,
  PaymentMethodService,
  ProcessContext,
  RequestContext,
  RequestContextService,
  ShippingMethod,
  ShippingMethodService,
  TransactionalConnection,
} from "@vendure/core";

import {
  bankTransferPaymentHandler,
  cashOnDeliveryPaymentHandler,
} from "../config/payment-handlers";
import {
  BANK_TRANSFER_CODE,
  CASH_ON_DELIVERY_CODE,
  loggerCtx,
  SEED_PAYMENT_METHODS,
  SEED_SHIPPING_METHODS,
} from "../constants";

const PAYMENT_HANDLER_BY_CODE: Record<string, string> = {
  [BANK_TRANSFER_CODE]: bankTransferPaymentHandler.code,
  [CASH_ON_DELIVERY_CODE]: cashOnDeliveryPaymentHandler.code,
};

/**
 * Makes sure the shop's shipping methods (ΕΛΤΑ, SPEEDEX, Μεταφορική) and payment methods (bank
 * deposit, cash on delivery) exist, matched by code. Existing ones are never changed, so the admin
 * keeps control of names, prices and descriptions.
 *
 * The first time they are created (i.e. once per database), every other shipping method is deleted
 * (soft: e.g. DHL and test methods) and every other payment method disabled, so these become the
 * only options. Methods the admin adds later are left alone.
 */
@Injectable()
export class CheckoutOptionsSeedService implements OnApplicationBootstrap {
  constructor(
    private processContext: ProcessContext,
    private requestContextService: RequestContextService,
    private connection: TransactionalConnection,
    private shippingMethodService: ShippingMethodService,
    private paymentMethodService: PaymentMethodService
  ) {}

  async onApplicationBootstrap() {
    if (!this.processContext.isServer) {
      return;
    }
    try {
      const ctx = await this.requestContextService.create({ apiType: "admin" });
      await this.seedShippingMethods(ctx);
      await this.seedPaymentMethods(ctx);
    } catch (e) {
      Logger.error(
        `Could not set up the checkout options: ${e instanceof Error ? e.message : String(e)}`,
        loggerCtx
      );
    }
  }

  private async seedShippingMethods(ctx: RequestContext) {
    // Includes soft-deleted methods (deletedAt is a plain column), so a method the admin deleted
    // is not re-created.
    const existing = await this.connection.getRepository(ctx, ShippingMethod).find();
    let created = 0;
    for (const def of SEED_SHIPPING_METHODS) {
      if (existing.some((sm) => sm.code === def.code)) {
        continue;
      }
      await this.shippingMethodService.create(ctx, {
        code: def.code,
        fulfillmentHandler: manualFulfillmentHandler.code,
        checker: {
          code: defaultShippingEligibilityChecker.code,
          arguments: [{ name: "orderMinimum", value: "0" }],
        },
        calculator: {
          code: defaultShippingCalculator.code,
          arguments: [
            { name: "rate", value: "0" },
            { name: "includesTax", value: "auto" },
            { name: "taxRate", value: "0" },
          ],
        },
        translations: def.translations,
        customFields: {
          requiresCarrierDetails: def.requiresCarrierDetails,
          trackingUrl: def.trackingUrl,
        },
      });
      created++;
      Logger.info(`Created shipping method "${def.code}"`, loggerCtx);
    }
    if (created === 0) {
      return;
    }
    const seedCodes = new Set(SEED_SHIPPING_METHODS.map((def) => def.code));
    for (const method of existing) {
      if (method.deletedAt || seedCodes.has(method.code)) {
        continue;
      }
      try {
        await this.shippingMethodService.softDelete(ctx, method.id);
        Logger.info(`Removed shipping method ${method.id} ("${method.code}")`, loggerCtx);
      } catch (e) {
        Logger.warn(`Could not remove shipping method ${method.id}: ${String(e)}`, loggerCtx);
      }
    }
  }

  private async seedPaymentMethods(ctx: RequestContext) {
    const existing = await this.connection.getRepository(ctx, PaymentMethod).find();
    let created = 0;
    for (const def of SEED_PAYMENT_METHODS) {
      if (existing.some((pm) => pm.code === def.code)) {
        continue;
      }
      await this.paymentMethodService.create(ctx, {
        code: def.code,
        enabled: true,
        handler: { code: PAYMENT_HANDLER_BY_CODE[def.code], arguments: [] },
        translations: def.translations,
      });
      created++;
      Logger.info(`Created payment method "${def.code}"`, loggerCtx);
    }
    if (created === 0) {
      return;
    }
    const seedCodes = new Set(SEED_PAYMENT_METHODS.map((def) => def.code));
    for (const method of existing) {
      if (!method.enabled || seedCodes.has(method.code)) {
        continue;
      }
      try {
        await this.paymentMethodService.update(ctx, { id: method.id, enabled: false });
        Logger.info(`Disabled payment method ${method.id} ("${method.code}")`, loggerCtx);
      } catch (e) {
        Logger.warn(`Could not disable payment method ${method.id}: ${String(e)}`, loggerCtx);
      }
    }
  }
}
