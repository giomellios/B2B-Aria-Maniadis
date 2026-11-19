import { LanguageCode, PluginCommonModule, VendurePlugin } from "@vendure/core";

import { shopApiExtensions } from "./api/api-extensions";
import { OrderTrackingShopResolver } from "./api/order-tracking.resolver";
import { carrierDetailsOrderProcess } from "./config/carrier-details-order-process";
import {
  bankTransferPaymentHandler,
  cashOnDeliveryPaymentHandler,
} from "./config/payment-handlers";
import { MAX_CARRIER_DETAILS_LENGTH } from "./constants";
import { CheckoutOptionsSeedService } from "./services/checkout-options-seed.service";
import "./types";

/**
 * The shop's delivery and payment options.
 *
 * - Shipping: ΕΛΤΑ, SPEEDEX and "Μεταφορική" (the customer's own transport company, typed into
 *   Order.customFields.carrierDetails; required when ShippingMethod.customFields.requiresCarrierDetails).
 * - Payment: bank deposit and cash on delivery, both settled by the admin in the Dashboard.
 * - Tracking: the admin types the tracking number on the order (Order.customFields.trackingNumber,
 *   admin-only) and sets each shipping method's tracking page (ShippingMethod.customFields.trackingUrl,
 *   "{code}" = the number). Customers read it through the Shop API field Order.tracking.
 * - CheckoutOptionsSeedService creates these methods on first start (see there).
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  compatibility: "^3.0.0",
  providers: [CheckoutOptionsSeedService],
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [OrderTrackingShopResolver],
  },
  configuration: (config) => {
    config.paymentOptions.paymentMethodHandlers.push(
      bankTransferPaymentHandler,
      cashOnDeliveryPaymentHandler
    );
    config.orderOptions.process.push(carrierDetailsOrderProcess);

    config.customFields.ShippingMethod.push({
      name: "requiresCarrierDetails",
      type: "boolean",
      defaultValue: false,
      nullable: false,
      public: true,
      label: [
        { languageCode: LanguageCode.en, value: "Customer names the transport company" },
        { languageCode: LanguageCode.el, value: "Ο πελάτης δηλώνει μεταφορική εταιρεία" },
      ],
      description: [
        {
          languageCode: LanguageCode.en,
          value:
            "The storefront asks for the customer's transport company when this method is chosen.",
        },
        {
          languageCode: LanguageCode.el,
          value:
            "Το κατάστημα ζητά από τον πελάτη τη μεταφορική του εταιρεία όταν επιλέγει αυτόν τον τρόπο.",
        },
      ],
    });

    config.customFields.ShippingMethod.push({
      name: "trackingUrl",
      type: "string",
      length: 500,
      nullable: true,
      public: false,
      label: [
        { languageCode: LanguageCode.en, value: "Tracking page" },
        { languageCode: LanguageCode.el, value: "Σελίδα εντοπισμού αποστολής" },
      ],
      description: [
        {
          languageCode: LanguageCode.en,
          value:
            "The carrier's tracking page shown to customers. Write {code} where the tracking number goes, e.g. https://example.com/track?id={code}; without {code} the customer types the number there.",
        },
        {
          languageCode: LanguageCode.el,
          value:
            "Η σελίδα εντοπισμού της εταιρείας που βλέπει ο πελάτης. Γράψτε {code} εκεί που μπαίνει ο αριθμός αποστολής, π.χ. https://example.com/track?id={code}· χωρίς {code} ο πελάτης πληκτρολογεί τον αριθμό εκεί.",
        },
      ],
    });

    config.customFields.Order.push({
      name: "trackingNumber",
      type: "string",
      length: 100,
      nullable: true,
      public: false,
      label: [
        { languageCode: LanguageCode.en, value: "Tracking number" },
        { languageCode: LanguageCode.el, value: "Αριθμός αποστολής (tracking)" },
      ],
      description: [
        {
          languageCode: LanguageCode.en,
          value:
            "The carrier's tracking number. The customer sees it with a tracking link on their order.",
        },
        {
          languageCode: LanguageCode.el,
          value:
            "Ο αριθμός αποστολής της μεταφορικής. Ο πελάτης τον βλέπει στην παραγγελία του, με σύνδεσμο εντοπισμού.",
        },
      ],
    });

    config.customFields.Order.push({
      name: "carrierDetails",
      type: "text",
      nullable: true,
      public: true,
      label: [
        { languageCode: LanguageCode.en, value: "Transport company" },
        { languageCode: LanguageCode.el, value: "Μεταφορική εταιρεία" },
      ],
      validate: (value: string | null | undefined) => {
        if (value && value.length > MAX_CARRIER_DETAILS_LENGTH) {
          return [
            {
              languageCode: LanguageCode.en,
              value: `At most ${MAX_CARRIER_DETAILS_LENGTH} characters.`,
            },
            {
              languageCode: LanguageCode.el,
              value: `Έως ${MAX_CARRIER_DETAILS_LENGTH} χαρακτήρες.`,
            },
          ];
        }
      },
    });
    return config;
  },
})
export class CheckoutOptionsPlugin {}
