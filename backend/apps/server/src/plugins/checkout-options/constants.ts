import { LanguageCode } from "@vendure/core";

export const loggerCtx = "CheckoutOptionsPlugin";

/** Shipping-method code whose orders need the customer's own carrier (OrderCustomFields.carrierDetails). */
export const CARRIER_SHIPPING_CODE = "metaforiki";
export const BANK_TRANSFER_CODE = "bank-transfer";
export const CASH_ON_DELIVERY_CODE = "cash-on-delivery";

/** Placeholder in ShippingMethod.customFields.trackingUrl replaced by the order's tracking number. */
export const TRACKING_CODE_PLACEHOLDER = "{code}";

/** Longest carrier description a customer may type. */
export const MAX_CARRIER_DETAILS_LENGTH = 500;

type Translations = Array<{ languageCode: LanguageCode; name: string; description: string }>;

/**
 * The shipping methods the shop offers, created on first start if missing (matched by code).
 * Prices start at 0: the admin sets the real rates in the Dashboard (Settings → Shipping methods).
 */
export const SEED_SHIPPING_METHODS: Array<{
  code: string;
  requiresCarrierDetails: boolean;
  /**
   * The carrier's tracking page (ShippingMethod.customFields.trackingUrl). Neither carrier documents
   * a link that opens a given shipment, so these are their search pages; the admin can replace them
   * with a link containing {code} in the Dashboard.
   */
  trackingUrl: string | null;
  translations: Translations;
}> = [
  {
    code: "elta",
    requiresCarrierDetails: false,
    trackingUrl: "https://itemsearch.elta.gr/el-GR",
    translations: [
      { languageCode: LanguageCode.el, name: "ΕΛΤΑ", description: "" },
      { languageCode: LanguageCode.en, name: "ELTA", description: "" },
    ],
  },
  {
    code: "speedex",
    requiresCarrierDetails: false,
    trackingUrl: "https://www.speedex.gr/",
    translations: [
      { languageCode: LanguageCode.el, name: "SPEEDEX", description: "" },
      { languageCode: LanguageCode.en, name: "SPEEDEX", description: "" },
    ],
  },
  {
    code: CARRIER_SHIPPING_CODE,
    requiresCarrierDetails: true,
    trackingUrl: null,
    translations: [
      {
        languageCode: LanguageCode.el,
        name: "Μεταφορική",
        description: "Αποστολή με τη μεταφορική εταιρεία της επιλογής σας.",
      },
      {
        languageCode: LanguageCode.en,
        name: "Transport company",
        description: "Shipped with the transport company of your choice.",
      },
    ],
  },
];

/** The payment methods the shop offers, created on first start if missing (matched by code). */
export const SEED_PAYMENT_METHODS: Array<{ code: string; translations: Translations }> = [
  {
    code: BANK_TRANSFER_CODE,
    translations: [
      {
        languageCode: LanguageCode.el,
        name: "Κατάθεση σε τράπεζα",
        description: "Η παραγγελία εκτελείται μόλις επιβεβαιωθεί η κατάθεση.",
      },
      {
        languageCode: LanguageCode.en,
        name: "Bank deposit",
        description: "The order is processed once the deposit is confirmed.",
      },
    ],
  },
  {
    code: CASH_ON_DELIVERY_CODE,
    translations: [
      {
        languageCode: LanguageCode.el,
        name: "Αντικαταβολή",
        description: "Πληρωμή κατά την παράδοση.",
      },
      {
        languageCode: LanguageCode.en,
        name: "Cash on delivery",
        description: "Pay when the order is delivered.",
      },
    ],
  },
];
