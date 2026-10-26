import "server-only";
import type { TadaDocumentNode } from "gql.tada";
import { print } from "graphql";
import { serverEnv } from "@/lib/config/env.server";
import type { Locale } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

const VENDURE_API_URL = serverEnv.shopApiUrl;
const VENDURE_CHANNEL_TOKEN = serverEnv.channelToken;
const VENDURE_AUTH_TOKEN_HEADER = serverEnv.authTokenHeader;
const VENDURE_CHANNEL_TOKEN_HEADER = serverEnv.channelTokenHeader;

interface VendureRequestOptions {
  token?: string;
  useAuthToken?: boolean;
  channelToken?: string;
  fetch?: RequestInit;
  tags?: string[];
  revalidateSeconds?: number;
  /**
   * Language for translated fields (product names, collections…). Defaults to the current
   * request's locale. Must be passed explicitly inside "use cache" functions, where request
   * headers cannot be read.
   */
  languageCode?: Locale;
}

interface VendureResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string }; [key: string]: unknown }>;
}

/**
 * The Shop API refused the request because nobody is signed in (or the session has expired): it
 * only answers signed-in customers, apart from sign-in / registration (server MembersOnlyPlugin).
 */
export class ForbiddenError extends Error {}

/**
 * Extract the Vendure auth token from response headers
 */
function extractAuthToken(headers: Headers): string | null {
  return headers.get(VENDURE_AUTH_TOKEN_HEADER);
}

/**
 * Execute a GraphQL query against the Vendure API
 */
export async function query<TResult, TVariables>(
  document: TadaDocumentNode<TResult, TVariables>,
  ...[variables, options]: TVariables extends Record<string, never>
    ? [variables?: TVariables, options?: VendureRequestOptions]
    : [variables: TVariables, options?: VendureRequestOptions]
): Promise<{ data: TResult; token?: string }> {
  const {
    token,
    useAuthToken,
    channelToken,
    fetch: fetchOptions,
    tags,
    revalidateSeconds,
    languageCode: explicitLanguageCode,
  } = options || {};
  const languageCode = explicitLanguageCode ?? (await getRequestLocale());

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions?.headers as Record<string, string>),
  };
  // Use the explicitly provided token, or fetch from cookies if useAuthToken is true
  let authToken = token;
  if (useAuthToken && !authToken) {
    const { getAuthToken } = await import("@/lib/api/auth-token");
    authToken = await getAuthToken();
  }

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  // Set the channel token header (use provided channelToken or default)
  headers[VENDURE_CHANNEL_TOKEN_HEADER] = channelToken || VENDURE_CHANNEL_TOKEN;

  const nextOptions =
    revalidateSeconds !== undefined || tags
      ? {
          ...(revalidateSeconds !== undefined && { revalidate: revalidateSeconds }),
          ...(tags && { tags }),
        }
      : undefined;

  const url = new URL(VENDURE_API_URL);
  url.searchParams.set("languageCode", languageCode);

  const response = await fetch(url, {
    ...fetchOptions,
    method: "POST",
    headers,
    body: JSON.stringify({
      query: print(document),
      variables: variables || {},
    }),
    ...(nextOptions && { next: nextOptions }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: VendureResponse<TResult> = await response.json();

  if (result.errors) {
    const message = result.errors.map((e) => e.message).join(", ");
    if (result.errors.every((e) => e.extensions?.code === "FORBIDDEN")) {
      throw new ForbiddenError(message);
    }
    throw new Error(message);
  }

  if (!result.data) {
    throw new Error("No data returned from Vendure API");
  }

  const newToken = extractAuthToken(response.headers);

  return {
    data: result.data,
    ...(newToken && { token: newToken }),
  };
}

/**
 * Execute a GraphQL mutation against the Vendure API
 */
export async function mutate<TResult, TVariables>(
  document: TadaDocumentNode<TResult, TVariables>,
  ...[variables, options]: TVariables extends Record<string, never>
    ? [variables?: TVariables, options?: VendureRequestOptions]
    : [variables: TVariables, options?: VendureRequestOptions]
): Promise<{ data: TResult; token?: string }> {
  // Mutations use the same underlying implementation as queries in GraphQL
  // @ts-expect-error - Complex conditional type inference, runtime behavior is correct
  return query(document, variables, options);
}
