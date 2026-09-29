import "server-only";

const shopApiUrl = process.env.VENDURE_SHOP_API_URL || process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;

if (!shopApiUrl) {
  throw new Error(
    "VENDURE_SHOP_API_URL or NEXT_PUBLIC_VENDURE_SHOP_API_URL environment variable is not set"
  );
}

export const serverEnv = {
  shopApiUrl,
  channelToken:
    process.env.VENDURE_CHANNEL_TOKEN ||
    process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN ||
    "__default_channel__",
  authTokenHeader: process.env.VENDURE_AUTH_TOKEN_HEADER || "vendure-auth-token",
  channelTokenHeader: process.env.VENDURE_CHANNEL_TOKEN_HEADER || "vendure-token",
  authTokenCookie: process.env.VENDURE_AUTH_TOKEN_COOKIE || "vendure-auth-token",
  /** Optional: `/api/revalidate` returns 500 when unset. */
  revalidationSecret: process.env.REVALIDATION_SECRET,
} as const;
