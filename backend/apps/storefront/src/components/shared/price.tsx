"use client";

import { INTL_LOCALE } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/provider";

interface PriceProps {
  value: number;
  currencyCode?: string;
}

export function Price({ value, currencyCode = "USD" }: PriceProps) {
  const locale = useLocale();
  return (
    <>
      {new Intl.NumberFormat(INTL_LOCALE[locale], {
        style: "currency",
        currency: currencyCode,
      }).format(value / 100)}
    </>
  );
}
