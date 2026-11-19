import type {
  CustomOrderFields,
  CustomShippingMethodFields,
} from "@vendure/core/dist/entity/custom-entity-fields";

declare module "@vendure/core/dist/entity/custom-entity-fields" {
  interface CustomShippingMethodFields {
    /** The customer must name their own transport company (Order.customFields.carrierDetails). */
    requiresCarrierDetails: boolean;
    /** The carrier's tracking page; "{code}" in it is replaced by the order's tracking number. */
    trackingUrl: string | null;
  }
  interface CustomOrderFields {
    /** The customer's transport company and its details, for "Μεταφορική" shipping. */
    carrierDetails: string | null;
    /** The shipment's tracking number, entered by an administrator (admin-only field). */
    trackingNumber: string | null;
  }
}

export type { CustomOrderFields, CustomShippingMethodFields };
