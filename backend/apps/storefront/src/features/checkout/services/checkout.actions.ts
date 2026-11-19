"use server";

import { mutate, query } from "@/lib/api/client";
import {
  SetOrderShippingAddressMutation,
  SetOrderBillingAddressMutation,
  SetOrderShippingMethodMutation,
  AddPaymentToOrderMutation,
  TransitionOrderToStateMutation,
  SetCustomerForOrderMutation,
  SetOrderCarrierDetailsMutation,
} from "@/features/checkout/services/mutations";
import { GetActiveOrderStateQuery } from "@/features/checkout/services/queries";
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

export type CheckoutActionResult = { success: true } | { success: false; error: string };

/**
 * An order is only editable in AddingItems. A failed payment attempt leaves it in ArrangingPayment,
 * which would block every later change (address, delivery) and every retry, so move it back first.
 */
async function reopenOrderForChanges() {
  const { data } = await query(GetActiveOrderStateQuery, {}, { useAuthToken: true });
  if (data.activeOrder?.state === "ArrangingPayment") {
    await mutate(TransitionOrderToStateMutation, { state: "AddingItems" }, { useAuthToken: true });
  }
}

export async function setShippingAddress(
  shippingAddress: AddressInput,
  useSameForBilling: boolean
): Promise<CheckoutActionResult> {
  const t = await getRequestT();
  try {
    await reopenOrderForChanges();
    const shippingResult = await mutate(
      SetOrderShippingAddressMutation,
      { input: shippingAddress },
      { useAuthToken: true }
    );
    const shipping = shippingResult.data.setOrderShippingAddress;
    if (shipping.__typename !== "Order") {
      return {
        success: false,
        error: "message" in shipping ? shipping.message : t.checkout.errors.address,
      };
    }

    if (useSameForBilling) {
      await mutate(
        SetOrderBillingAddressMutation,
        { input: shippingAddress },
        { useAuthToken: true }
      );
    }
  } catch (error) {
    console.error("setShippingAddress failed:", error);
    return { success: false, error: t.checkout.errors.address };
  }

  revalidatePath("/[locale]/checkout", "page");
  return { success: true };
}

/**
 * Sets the delivery method. `carrierDetails` is the customer's own transport company for methods
 * that ask for one (ShippingMethod.customFields.requiresCarrierDetails); null clears it.
 */
export async function setShippingMethod(
  shippingMethodId: string,
  carrierDetails: string | null
): Promise<CheckoutActionResult> {
  const t = await getRequestT();
  try {
    await reopenOrderForChanges();
    const details = await mutate(
      SetOrderCarrierDetailsMutation,
      { carrierDetails: carrierDetails?.trim() || null },
      { useAuthToken: true }
    );
    const detailsResult = details.data.setOrderCustomFields;
    if (detailsResult.__typename !== "Order") {
      return {
        success: false,
        error: "message" in detailsResult ? detailsResult.message : t.checkout.errors.delivery,
      };
    }

    const result = await mutate(
      SetOrderShippingMethodMutation,
      { shippingMethodId: [shippingMethodId] },
      { useAuthToken: true }
    );
    const shipping = result.data.setOrderShippingMethod;
    if (shipping.__typename !== "Order") {
      return {
        success: false,
        error: "message" in shipping ? shipping.message : t.checkout.errors.delivery,
      };
    }
  } catch (error) {
    console.error("setShippingMethod failed:", error);
    return { success: false, error: t.checkout.errors.delivery };
  }

  revalidatePath("/[locale]/checkout", "page");
  return { success: true };
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

/**
 * Moves the order to ArrangingPayment (unless a previous attempt already did) and adds the payment.
 * Redirects to the confirmation page on success. On failure the order goes back to AddingItems, so
 * the customer can change something and try again, and the reason is returned for the UI.
 */
export async function placeOrder(paymentMethodCode: string): Promise<CheckoutActionResult> {
  const t = await getRequestT();
  let orderCode: string;
  try {
    const { data } = await query(GetActiveOrderStateQuery, {}, { useAuthToken: true });
    if (data.activeOrder?.state !== "ArrangingPayment") {
      const transition = await mutate(
        TransitionOrderToStateMutation,
        { state: "ArrangingPayment" },
        { useAuthToken: true }
      );
      const transitionResult = transition.data.transitionOrderToState;
      if (transitionResult?.__typename === "OrderStateTransitionError") {
        return {
          success: false,
          error: transitionResult.transitionError || transitionResult.message,
        };
      }
    }

    const result = await mutate(
      AddPaymentToOrderMutation,
      { input: { method: paymentMethodCode, metadata: {} } },
      { useAuthToken: true }
    );
    const payment = result.data.addPaymentToOrder;
    if (payment.__typename !== "Order") {
      await mutate(
        TransitionOrderToStateMutation,
        { state: "AddingItems" },
        { useAuthToken: true }
      );
      revalidatePath("/[locale]/checkout", "page");
      const reason =
        "paymentErrorMessage" in payment && payment.paymentErrorMessage
          ? payment.paymentErrorMessage
          : payment.message;
      return { success: false, error: reason || t.checkout.errors.placeOrder };
    }
    orderCode = payment.code;
  } catch (error) {
    console.error("placeOrder failed:", error);
    return { success: false, error: t.checkout.errors.tryAgain };
  }

  // Update the cart tag to immediately invalidate cached cart data
  updateTag("cart");
  updateTag("active-order");

  await localeRedirect(`/order-confirmation/${orderCode}`);
  return { success: true };
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
