import "server-only";
import { redirect } from "next/navigation";
import { localizePath } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

/** redirect() to an internal path in the current request's locale (works in pages and Server Actions). */
export async function localeRedirect(path: string): Promise<never> {
  redirect(localizePath(path, await getRequestLocale()));
}
