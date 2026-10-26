/**
 * Pages that show products, prices or orders: only signed-in customers (who are always approved,
 * see the customer-approval plugin) may open them. The proxy sends visitors without a session
 * cookie to sign-in; the pages also check the session with Vendure (requireActiveCustomer), which
 * catches expired or revoked sessions.
 */
const MEMBERS_ONLY_PATHS = [
  "/product",
  "/collection",
  "/search",
  "/cart",
  "/checkout",
  "/order-confirmation",
];

/** `path` without the locale prefix, with or without a query string. */
export function isMembersOnlyPath(path: string): boolean {
  const pathname = path.split("?")[0];
  return MEMBERS_ONLY_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
