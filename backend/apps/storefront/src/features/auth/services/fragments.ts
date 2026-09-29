import { graphql } from "@/lib/api/graphql";

export const ActiveCustomerFragment = graphql(`
  fragment ActiveCustomer on Customer {
    id
    firstName
    lastName
    emailAddress
  }
`);
