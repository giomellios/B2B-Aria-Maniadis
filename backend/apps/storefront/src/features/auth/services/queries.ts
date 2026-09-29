import { graphql } from "@/lib/api/graphql";
import { ActiveCustomerFragment } from "@/features/auth/services/fragments";

export const GetActiveCustomerQuery = graphql(
  `
    query GetActiveCustomer {
      activeCustomer {
        ...ActiveCustomer
      }
    }
  `,
  [ActiveCustomerFragment]
);
