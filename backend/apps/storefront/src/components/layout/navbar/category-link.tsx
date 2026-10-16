"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { Link } from "@/lib/i18n/navigation";
import { stripLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/** Category bar link, underlined while its page is open. */
export function CategoryLink({
  href,
  className,
  ...rest
}: ComponentProps<typeof Link> & { href: string }) {
  const isActive = stripLocale(usePathname()) === href;
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(className, isActive && "border-primary text-primary")}
      {...rest}
    />
  );
}
