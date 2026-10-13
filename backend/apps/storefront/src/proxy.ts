import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_HEADER, isLocale } from "@/lib/i18n/config";

/**
 * Every page lives under /el/... or /en/....
 * - A URL without a locale (e.g. a link from a Vendure email) is redirected to the visitor's
 *   saved language, or Greek by default.
 * - Requests with a locale get an x-locale header, so Server Actions and the Vendure API client
 *   (which cannot read route params) know which language to use.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (!isLocale(first)) {
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = isLocale(saved) ? saved : DEFAULT_LOCALE;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    url.search = search;
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, first);
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Remember the language the visitor is browsing in (the switcher just links to the other locale)
  if (request.cookies.get(LOCALE_COOKIE)?.value !== first) {
    response.cookies.set(LOCALE_COOKIE, first, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  // Everything except API routes, Next.js internals and files with an extension (logo.png, favicon.ico…)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
