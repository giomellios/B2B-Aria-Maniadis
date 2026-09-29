import "server-only";
import { query } from "@/lib/api/client";
import { getAvailableCountriesCached } from "@/lib/queries/cached";
import { GetCustomerAddressesQuery } from "@/features/account/server";
import {
  GetActiveOrderForCheckoutQuery,
  GetEligiblePaymentMethodsQuery,
  GetEligibleShippingMethodsQuery,
  GetOrderByCodeQuery,
} from "@/features/checkout/services/queries";

/** Everything the checkout page needs, fetched in parallel. */
export async function getCheckoutData({ isGuest }: { isGuest: boolean }) {
  const [orderRes, addressesRes, countries, shippingMethodsRes, paymentMethodsRes] =
    await Promise.all([
      query(GetActiveOrderForCheckoutQuery, {}, { useAuthToken: true }),
      isGuest
        ? Promise.resolve({ data: { activeCustomer: null } })
        : query(GetCustomerAddressesQuery, {}, { useAuthToken: true }),
      getAvailableCountriesCached(),
      query(GetEligibleShippingMethodsQuery, {}, { useAuthToken: true }),
      query(GetEligiblePaymentMethodsQuery, {}, { useAuthToken: true }),
    ]);

  return {
    activeOrder: orderRes.data.activeOrder,
    addresses: addressesRes.data.activeCustomer?.addresses || [],
    countries,
    shippingMethods: shippingMethodsRes.data.eligibleShippingMethods || [],
    paymentMethods:
      paymentMethodsRes.data.eligiblePaymentMethods?.filter((m) => m.isEligible) || [],
  };
}

export async function getOrderByCode(code: string) {
  const { data } = await query(GetOrderByCodeQuery, { code }, { useAuthToken: true });
  return data.orderByCode;
}
