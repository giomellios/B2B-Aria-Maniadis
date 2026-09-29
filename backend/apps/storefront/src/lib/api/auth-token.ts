import "server-only";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/config/env.server";

const AUTH_TOKEN_COOKIE = serverEnv.authTokenCookie;

export async function setAuthToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_TOKEN_COOKIE, token);
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
}

export async function removeAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_TOKEN_COOKIE);
}
