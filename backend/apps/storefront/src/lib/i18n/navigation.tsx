"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, type ComponentProps } from "react";
import { localizePath } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/provider";

/** next/link that prefixes internal paths with the current locale ("/cart" → "/el/cart"). */
export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  const localizedHref = typeof href === "string" ? localizePath(href, locale) : href;
  return <NextLink href={localizedHref} {...props} />;
}

/** useRouter whose push/replace/prefetch prefix internal paths with the current locale. */
export function useLocaleRouter() {
  const router = useRouter();
  const locale = useLocale();
  return useMemo(
    () => ({
      ...router,
      push: (href: string, options?: Parameters<typeof router.push>[1]) =>
        router.push(localizePath(href, locale), options),
      replace: (href: string, options?: Parameters<typeof router.replace>[1]) =>
        router.replace(localizePath(href, locale), options),
      prefetch: (href: string) => router.prefetch(localizePath(href, locale)),
    }),
    [router, locale]
  );
}
