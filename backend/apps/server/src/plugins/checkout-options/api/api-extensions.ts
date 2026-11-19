import gql from "graphql-tag";

export const shopApiExtensions = gql`
  "Where the customer can follow their shipment."
  type OrderTracking {
    "The shipment's tracking number (entered by the shop)."
    trackingNumber: String!
    "The shipping method's name, e.g. SPEEDEX."
    carrier: String
    "The carrier's tracking page, if the shop set one for this shipping method."
    url: String
    "True when url already opens this shipment; otherwise the customer types the number there."
    urlIncludesNumber: Boolean!
  }

  extend type Order {
    "Tracking for this order, once the shop has added a tracking number."
    tracking: OrderTracking
  }
`;
