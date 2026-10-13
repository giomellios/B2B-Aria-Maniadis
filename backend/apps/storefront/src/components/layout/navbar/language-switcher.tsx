"use client";

import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LOCALES, localizePath, stripLocale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * ΕΛ | EN toggle. Links to the same page in the other language (keeping the query string);
 * the proxy then remembers the choice in a cookie.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const path = stripLocale(pathname);

  return (
    <div
      role="group"
      aria-label={dictionaries[locale].language.label}
      className={cn(
        "relative flex h-8 items-center rounded-full border border-border p-0.5 text-[0.6875rem] font-semibold tracking-wide",
        className
      )}
    >
      {/* Sliding pill behind the active language */}
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-primary transition-transform duration-300 ease-out",
          locale === LOCALES[1] && "translate-x-full"
        )}
      />
      {LOCALES.map((target) => {
        const isActive = target === locale;
        const t = dictionaries[target].language;
        return (
          <NextLink
            key={target}
            href={`${localizePath(path, target)}${query ? `?${query}` : ""}`}
            hrefLang={target}
            lang={target}
            aria-current={isActive ? "true" : undefined}
            aria-label={isActive ? t.name : t.switchTo}
            scroll={false}
            className={cn(
              "relative z-10 flex h-full w-9 items-center justify-center rounded-full transition-colors duration-300",
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.short}
          </NextLink>
        );
      })}
    </div>
  );
}
