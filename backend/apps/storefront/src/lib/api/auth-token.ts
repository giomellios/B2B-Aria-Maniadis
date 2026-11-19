import "server-only";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/config/env.server";

const AUTH_TOKEN_COOKIE = serverEnv.authTokenCookie;
/** Marks a "remember me" sign-in, so a refreshed token keeps the same lifetime. */
const REMEMBER_ME_COOKIE = `${AUTH_TOKEN_COOKIE}-remember`;
/** How long a "remember me" sign-in survives closing the browser. */
const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

/**
 * Stores the Vendure session token.
 * - `remember: true` → persistent cookie (30 days).
 * - `remember: false` → browser-session cookie (gone when the browser closes).
 * - omitted (e.g. a token refreshed by a cart action) → keeps whatever the sign-in chose.
 */
export async function setAuthToken(token: string, options?: { remember?: boolean }) {
  const cookieStore = await cookies();
  const remember = options?.remember ?? cookieStore.get(REMEMBER_ME_COOKIE)?.value === "1";

  if (remember) {
    cookieStore.set(AUTH_TOKEN_COOKIE, token, { maxAge: REMEMBER_ME_MAX_AGE });
    cookieStore.set(REMEMBER_ME_COOKIE, "1", { maxAge: REMEMBER_ME_MAX_AGE, httpOnly: true });
  } else {
    cookieStore.set(AUTH_TOKEN_COOKIE, token);
    cookieStore.delete(REMEMBER_ME_COOKIE);
  }
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
}

export async function removeAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_TOKEN_COOKIE);
  cookieStore.delete(REMEMBER_ME_COOKIE);
}
