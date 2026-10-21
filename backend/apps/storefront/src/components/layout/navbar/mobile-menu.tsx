"use client";

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
import { ThemeSwitcher } from "@/components/layout/navbar/theme-switcher";
import { Link } from "@/lib/i18n/navigation";

/** Phone and tablet navigation: the same links as the desktop bar, plus language and theme. */
export function MobileMenu({
  label,
  links,
}: {
  label: string;
  links: { href: string; label: string }[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="size-5" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-60 p-2">
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild className="h-11 text-base">
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1.5">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
