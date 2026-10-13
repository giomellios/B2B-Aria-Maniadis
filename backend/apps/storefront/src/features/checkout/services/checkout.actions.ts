"use server";

import { mutate } from "@/lib/api/client";
import {
  SetOrderShippingAddressMutation,
  SetOrderBillingAddressMutation,
  SetOrderShippingMethodMutation,
  AddPaymentToOrderMutation,
  TransitionOrderToStateMutation,
  SetCustomerForOrderMutation,
} from "@/features/checkout/services/mutations";
import { CreateCustomerAddressMutation } from "@/features/account/server";
import { revalidatePath, updateTag } from "next/cache";
import { localeRedirect } from "@/lib/i18n/redirect";
import { getRequestT } from "@/lib/i18n/server";

interface AddressInput {
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
  company?: string;
}

export async function setShippingAddress(
  shippingAddress: AddressInput,
  useSameForBilling: boolean
) {
  const shippingResult = await mutate(
    SetOrderShippingAddressMutation,
    { input: shippingAddress },
    { useAuthToken: true }
  );

  if (shippingResult.data.setOrderShippingAddress.__typename !== "Order") {
    throw new Error("Failed to set shipping address");
  }

  if (useSameForBilling) {
    await mutate(
      SetOrderBillingAddressMutation,
      { input: shippingAddress },
      { useAuthToken: true }
    );
  }

  revalidatePath("/[locale]/checkout", "page");
}

export async function setShippingMethod(shippingMethodId: string) {
  const result = await mutate(
    SetOrderShippingMethodMutation,
    { shippingMethodId: [shippingMethodId] },
    { useAuthToken: true }
  );

  if (result.data.setOrderShippingMethod.__typename !== "Order") {
    throw new Error("Failed to set shipping method");
  }

  revalidatePath("/[locale]/checkout", "page");
}

export async function createCustomerAddress(address: AddressInput) {
  const result = await mutate(
    CreateCustomerAddressMutation,
    { input: address },
    { useAuthToken: true }
  );

  if (!result.data.createCustomerAddress) {
    throw new Error("Failed to create customer address");
  }

  revalidatePath("/[locale]/checkout", "page");
  return result.data.createCustomerAddress;
}

export async function transitionToArrangingPayment() {
  const result = await mutate(
    TransitionOrderToStateMutation,
    { state: "ArrangingPayment" },
    { useAuthToken: true }
  );

  if (result.data.transitionOrderToState?.__typename === "OrderStateTransitionError") {
    const errorResult = result.data.transitionOrderToState;
    throw new Error(
      `Failed to transition order state: ${errorResult.errorCode} - ${errorResult.message}`
    );
  }

  revalidatePath("/[locale]/checkout", "page");
}

export async function placeOrder(paymentMethodCode: string) {
  // First, transition the order to ArrangingPayment state
  await transitionToArrangingPayment();

  // Prepare metadata based on payment method
  const metadata: Record<string, unknown> = {};

  // For standard payment, include the required fields
  if (paymentMethodCode === "standard-payment") {
    metadata.shouldDecline = false;
    metadata.shouldError = false;
    metadata.shouldErrorOnSettle = false;
  }

  // Add payment to the order
  const result = await mutate(
    AddPaymentToOrderMutation,
    {
      input: {
        method: paymentMethodCode,
        metadata,
      },
    },
    { useAuthToken: true }
  );

  if (result.data.addPaymentToOrder.__typename !== "Order") {
    const errorResult = result.data.addPaymentToOrder;
    throw new Error(`Failed to place order: ${errorResult.errorCode} - ${errorResult.message}`);
  }

  const orderCode = result.data.addPaymentToOrder.code;

  // Update the cart tag to immediately invalidate cached cart data
  updateTag("cart");
  updateTag("active-order");

  await localeRedirect(`/order-confirmation/${orderCode}`);
}

interface GuestCustomerInput {
  emailAddress: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export type SetCustomerForOrderResult =
  | { success: true }
  | { success: false; errorCode: "EMAIL_CONFLICT"; message: string }
  | { success: false; errorCode: "GUEST_CHECKOUT_DISABLED"; message: string }
  | { success: false; errorCode: "NO_ACTIVE_ORDER"; message: string }
  | { success: false; errorCode: "UNKNOWN"; message: string };

export async function setCustomerForOrder(
  input: GuestCustomerInput
): Promise<SetCustomerForOrderResult> {
  const result = await mutate(SetCustomerForOrderMutation, { input }, { useAuthToken: true });

  const response = result.data.setCustomerForOrder;

  switch (response.__typename) {
    case "Order":
      revalidatePath("/[locale]/checkout", "page");
      return { success: true };
    case "AlreadyLoggedInError":
      return { success: true };
    case "EmailAddressConflictError":
      return { success: false, errorCode: "EMAIL_CONFLICT", message: response.message };
    case "GuestCheckoutError":
      return { success: false, errorCode: "GUEST_CHECKOUT_DISABLED", message: response.message };
    case "NoActiveOrderError":
      return { success: false, errorCode: "NO_ACTIVE_ORDER", message: response.message };
    default:
      return {
        success: false,
        errorCode: "UNKNOWN",
        message: (await getRequestT()).common.unknownError,
      };
  }
}
