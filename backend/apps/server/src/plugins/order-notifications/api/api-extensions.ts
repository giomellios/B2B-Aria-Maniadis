import gql from "graphql-tag";

export const adminApiExtensions = gql`
  type UnseenOrders {
    "How many placed orders no administrator has seen yet."
    totalItems: Int!
    "The newest of them (at most \`take\`)."
    items: [Order!]!
  }

  extend type Query {
    "Placed (not cancelled) orders no administrator has opened or marked as seen yet, newest first. Drives the Dashboard's new-order alert."
    unseenOrders(take: Int): UnseenOrders!
  }

  extend type Mutation {
    """
    Marks placed orders as seen by an administrator; returns how many changed.
    ids: only these orders. placedUpTo: every unseen order placed at or before this time
    (what the alert showed). Neither: every unseen order.
    """
    markOrdersSeen(ids: [ID!], placedUpTo: DateTime): Int!
  }
`;
