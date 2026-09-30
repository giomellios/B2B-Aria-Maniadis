import gql from "graphql-tag";

export const adminApiExtensions = gql`
  extend type Mutation {
    "Approve a B2B customer account (also marks the account as verified). Only approved customers can log in."
    approveCustomer(id: ID!): Customer!
    "Revoke a customer's approval and log them out of all sessions."
    revokeCustomerApproval(id: ID!): Customer!
    manuallyVerifyCustomer(id: ID!): Boolean! @deprecated(reason: "Use approveCustomer")
  }
`;
