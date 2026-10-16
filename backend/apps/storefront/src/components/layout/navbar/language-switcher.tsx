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
          shownLocale === LOCALES[1] && "translate-x-full"
        )}
      />
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
              "relative z-10 flex h-full w-9 items-center justify-center rounded-full transition-colors duration-300",
              isShown ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.short}
          </NextLink>
        );
      })}
    </div>
  );
}
