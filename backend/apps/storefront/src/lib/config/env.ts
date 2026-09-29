/**
 * Environment values that are safe to import from client components.
 * `NEXT_PUBLIC_*` vars must be read with literal `process.env.X` access so Next can inline them.
 * Server-only values live in `env.server.ts`.
 */

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Vendure Store";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

/**
 * Shop API URL used to resolve relative asset paths. On the client only the
 * `NEXT_PUBLIC_*` variants are defined; on the server `VENDURE_SHOP_API_URL` also applies.
 */
export const ASSET_API_URL =
  process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL ||
  process.env.VENDURE_SHOP_API_URL ||
  process.env.NEXT_PUBLIC_VENDURE_API_URL;
