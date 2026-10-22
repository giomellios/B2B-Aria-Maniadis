"use client";

import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { LOCALES, localizePath, stripLocale, type Locale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { beginLocaleSwitch, settleLocaleSwitch } from "@/lib/i18n/locale-switch";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * ΕΛ | EN toggle. Links to the same page in the other language (keeping the query string);
 * the proxy then remembers the choice in a cookie.
 *
 * The switch remounts the whole page, so to keep it smooth: the other language is fully
 * prefetched as soon as the visitor shows intent (hover/focus/touch), the pill moves immediately,
 * and entrance animations are not replayed (see lib/i18n/locale-switch.ts).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const path = stripLocale(pathname);
  // Optimistic pill position, only valid while still on the language the click started from.
  const [pending, setPending] = useState<{ from: Locale; to: Locale } | null>(null);
  const [intent, setIntent] = useState(false);
  const shownLocale = pending?.from === locale ? pending.to : locale;

  // Rendered in the new language: let the entrance-animation suppression wind down.
  useEffect(() => {
    settleLocaleSwitch();
  }, [locale]);

  // With cacheComponents, Next keeps the page we navigated away from alive in a hidden <Activity>
  // and restores it, state included, on Back/Forward. Effects are cleaned up when a page is hidden,
  // so drop the optimistic pill then — otherwise the restored Greek page keeps the pill on "EN".
  useEffect(() => () => setPending(null), []);

  const handleClick = (event: MouseEvent, target: Locale) => {
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (target === locale || modified || event.button !== 0) return;
    setPending({ from: locale, to: target });
    beginLocaleSwitch();
  };

  return (
    <div
      role="group"
      aria-label={dictionaries[locale].language.label}
      onPointerEnter={() => setIntent(true)}
      onFocus={() => setIntent(true)}
      onTouchStart={() => setIntent(true)}
      className={cn("flex h-9 items-center text-sm font-medium", className)}
    >
      {LOCALES.map((target) => {
        const isActive = target === locale;
        const isShown = target === shownLocale;
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
            prefetch={isActive ? false : intent ? true : null}
            onClick={(event) => handleClick(event, target)}
            className={cn(
              "flex h-full items-center px-1.5 underline-offset-[6px] transition-colors duration-200",
              isShown
                ? "text-foreground underline decoration-gold decoration-2"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.short}
          </NextLink>
        );
      })}
    </div>
  );
}
