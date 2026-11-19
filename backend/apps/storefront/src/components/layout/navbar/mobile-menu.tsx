"use client";

import { usePathname } from "next/navigation";
import { Menu } from "@/design-system/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system";
import { LanguageSwitcher } from "@/components/layout/navbar/language-switcher";
import { LoginButton } from "@/features/auth";
import { Link } from "@/lib/i18n/navigation";
import { stripLocale } from "@/lib/i18n/config";

/** Phone and tablet navigation: the same links as the desktop bar, plus the language. */
export function MobileMenu({
  label,
  links,
  signedIn = false,
}: {
  label: string;
  links: { href: string; label: string }[];
  /** Adds "Sign out" (on phones the profile menu in the bar is hidden). */
  signedIn?: boolean;
}) {
  const currentPath = stripLocale(usePathname());
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="size-5" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-60 p-2">
        {links.map((link) =>
          // The page you're on is shown as current but doesn't navigate (no refetch of it).
          link.href === currentPath ? (
            <DropdownMenuItem
              key={link.href}
              aria-current="page"
              className="h-11 text-base font-medium"
            >
              {link.label}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={link.href} asChild className="h-11 text-base">
              <Link href={link.href}>{link.label}</Link>
            </DropdownMenuItem>
          )
        )}
        {signedIn && (
          <DropdownMenuItem asChild className="h-11 text-base">
            <LoginButton isLoggedIn className="w-full" />
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <LanguageSwitcher />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
