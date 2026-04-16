import { query } from "./api";
import { GetActiveCustomerQuery } from "./queries";
import { getActiveChannelCached } from "./cached";
import { cache } from "react";
import { readFragment } from "@/graphql";
import { ActiveCustomerFragment } from "@/lib/vendure/fragments";
import { getAuthToken } from "@/lib/auth";
import { parse } from "graphql";

const GetActiveCustomerCustomFieldsObjectQuery = parse(`
  query GetActiveCustomerCustomFieldsObject {
    activeCustomer {
      customFields {
        vatNumber
        company
      }
    }
  }
`);

const GetActiveCustomerCustomFieldsScalarQuery = parse(`
  query GetActiveCustomerCustomFieldsScalar {
    activeCustomer {
      customFields
    }
  }
`);

type CustomerCustomFields = {
  vatNumber: string;
  company: string;
};

function normalizeCustomFields(value: unknown): CustomerCustomFields {
  if (!value || typeof value !== "object") {
    return { vatNumber: "", company: "" };
  }

  const maybeFields = value as Record<string, unknown>;
  return {
    vatNumber: typeof maybeFields.vatNumber === "string" ? maybeFields.vatNumber : "",
    company: typeof maybeFields.company === "string" ? maybeFields.company : "",
  };
}

export const getActiveCustomer = cache(async () => {
  const token = await getAuthToken();
  const result = await query(GetActiveCustomerQuery, undefined, {
    token,
  });
  return readFragment(ActiveCustomerFragment, result.data.activeCustomer);
});

export const getActiveCustomerCustomFields = cache(async (): Promise<CustomerCustomFields> => {
  const token = await getAuthToken();

  try {
    const objectResult = await query(
      GetActiveCustomerCustomFieldsObjectQuery as never,
      undefined,
      { token }
    );

    return normalizeCustomFields(
      (objectResult.data as { activeCustomer?: { customFields?: unknown } | null }).activeCustomer
        ?.customFields
    );
  } catch {
    try {
      const scalarResult = await query(
        GetActiveCustomerCustomFieldsScalarQuery as never,
        undefined,
        { token }
      );

      return normalizeCustomFields(
        (scalarResult.data as { activeCustomer?: { customFields?: unknown } | null }).activeCustomer
          ?.customFields
      );
    } catch {
      return { vatNumber: "", company: "" };
    }
  }
});

export const getActiveChannel = getActiveChannelCached;
