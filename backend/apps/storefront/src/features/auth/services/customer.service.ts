import "server-only";
import { query } from "@/lib/api/client";
import { GetActiveCustomerQuery } from "@/features/auth/services/queries";
import { cache } from "react";
import { graphql, readFragment } from "@/lib/api/graphql";
import { ActiveCustomerFragment } from "@/features/auth/services/fragments";
import { getAuthToken } from "@/lib/api/auth-token";

const GetActiveCustomerCustomFieldsQuery = graphql(`
  query GetActiveCustomerCustomFields {
    activeCustomer {
      customFields {
        vatNumber
        company
      }
    }
  }
`);

type CustomerCustomFields = {
  vatNumber: string;
  company: string;
};

export const getActiveCustomer = cache(async () => {
  const token = await getAuthToken();
  const result = await query(GetActiveCustomerQuery, undefined, {
    token,
  });
  return readFragment(ActiveCustomerFragment, result.data.activeCustomer);
});

export const getActiveCustomerCustomFields = cache(async (): Promise<CustomerCustomFields> => {
  const token = await getAuthToken();
  const result = await query(GetActiveCustomerCustomFieldsQuery, undefined, { token });
  const customFields = result.data.activeCustomer?.customFields;
  return {
    vatNumber: customFields?.vatNumber ?? "",
    company: customFields?.company ?? "",
  };
});
