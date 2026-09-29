import "server-only";
import { mutate, query } from "@/lib/api/client";
import { GetAvailableCountriesQuery } from "@/lib/queries/shared-queries";
import {
  GetCustomerAddressesQuery,
  GetCustomerOrdersQuery,
  GetOrderDetailQuery,
} from "@/features/account/services/queries";
import { UpdateCustomerEmailAddressMutation } from "@/features/account/services/mutations";

/** Saved addresses plus the country list for the address form. */
export async function getAddressBook() {
  const [addressesResult, countriesResult] = await Promise.all([
    query(GetCustomerAddressesQuery, {}, { useAuthToken: true }),
    query(GetAvailableCountriesQuery, {}),
  ]);

  return {
    addresses: addressesResult.data.activeCustomer?.addresses || [],
    countries: countriesResult.data.availableCountries || [],
  };
}

/** Placed orders (everything except the open cart), or null when signed out. */
export async function getCustomerOrders({ take, skip }: { take: number; skip: number }) {
  const { data } = await query(
    GetCustomerOrdersQuery,
    {
      options: {
        take,
        skip,
        filter: {
          state: {
            notEq: "AddingItems",
          },
        },
      },
    },
    { useAuthToken: true }
  );
  return data.activeCustomer;
}

export async function getOrderDetail(code: string) {
  const { data } = await query(GetOrderDetailQuery, { code }, { useAuthToken: true, fetch: {} });
  return data.orderByCode;
}

/** Confirms an email change with the token from the verification email. */
export async function confirmEmailAddressChange(token: string) {
  const result = await mutate(
    UpdateCustomerEmailAddressMutation,
    { token },
    { useAuthToken: true }
  );
  return result.data.updateCustomerEmailAddress;
}
