"use client";

import { usePathname } from "next/navigation";
import { ComponentProps } from "react";
import { Link } from "@/lib/i18n/navigation";
import { stripLocale } from "@/lib/i18n/config";
import { NavigationMenuLink } from "@/design-system";
import { cn } from "@/lib/utils";

export function NavbarLink({ href, className, children, ...rest }: ComponentProps<typeof Link>) {
  const isActive = stripLocale(usePathname()) === href;

  return (
    <NavigationMenuLink asChild active={isActive}>
      <Link
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-transparent hover:text-primary focus:bg-transparent data-[active=true]:bg-transparent data-[active=true]:text-primary data-[active=true]:hover:bg-transparent data-[active=true]:focus:bg-transparent",
          className
        )}
        href={href}
        {...rest}
      >
        <span className="link-underline" aria-current={isActive ? "page" : undefined}>
          {children}
        </span>
      </Link>
    </NavigationMenuLink>
  );
}
