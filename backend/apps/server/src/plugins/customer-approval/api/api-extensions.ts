import gql from "graphql-tag";

export const adminApiExtensions = gql`
  type PendingCustomerApprovals {
    "How many registered customers are waiting for approval."
    totalItems: Int!
    "The newest of them (at most \`take\`)."
    items: [Customer!]!
  }

  extend type Query {
    "Customers who registered an account and are waiting for an administrator's approval (newest first). Drives the Dashboard's new-registration alert."
    pendingCustomerApprovals(take: Int): PendingCustomerApprovals!
  }

  extend type Mutation {
    "Approve a B2B customer account (also marks the account as verified). Only approved customers can log in."
    approveCustomer(id: ID!): Customer!
    "Revoke a customer's approval and log them out of all sessions."
    revokeCustomerApproval(id: ID!): Customer!
    manuallyVerifyCustomer(id: ID!): Boolean! @deprecated(reason: "Use approveCustomer")
  }
`;
