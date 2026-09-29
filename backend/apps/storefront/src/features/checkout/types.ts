import { ResultOf } from "@/lib/api/graphql";
import { GetActiveOrderForCheckoutQuery } from "@/features/checkout/services/queries";

export type CheckoutOrder = NonNullable<
  ResultOf<typeof GetActiveOrderForCheckoutQuery>["activeOrder"]
>;
export type OrderLine = CheckoutOrder["lines"][number];
export type ShippingAddress = CheckoutOrder["shippingAddress"];
export type BillingAddress = CheckoutOrder["billingAddress"];

export interface CustomerAddress {
  id: string;
  fullName?: string | null;
  company?: string | null;
  streetLine1: string;
  streetLine2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country: { id: string; code: string; name: string };
  phoneNumber?: string | null;
  defaultShippingAddress?: boolean | null;
  defaultBillingAddress?: boolean | null;
}

export interface Country {
  id: string;
  code: string;
  name: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  priceWithTax: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isEligible: boolean;
  eligibilityMessage?: string | null;
}

export interface CheckoutContextType {
  order: CheckoutOrder;
  addresses: CustomerAddress[];
  countries: Country[];
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  selectedPaymentMethodCode: string | null;
  setSelectedPaymentMethodCode: (code: string | null) => void;
  isGuest: boolean;
}
