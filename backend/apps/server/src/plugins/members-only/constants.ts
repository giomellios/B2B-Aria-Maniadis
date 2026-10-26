/**
 * Shop API operations (top-level Query / Mutation fields) that callers who are not signed in may
 * use: just enough to sign in, register and reset a password. Everything else (products,
 * collections, search, facets, orders…) needs a signed-in customer.
 */
export const PUBLIC_SHOP_OPERATIONS: ReadonlySet<string> = new Set([
  // Queries
  "activeChannel",
  "availableCountries",
  "activeCustomer",
  "me",
  // Mutations
  "login",
  "logout",
  "registerCustomerAccount",
  "requestPasswordReset",
  "resetPassword",
]);
