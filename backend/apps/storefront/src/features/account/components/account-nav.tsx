"use client";

import { Link } from "@/lib/i18n/navigation";
import { stripLocale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/provider";
import { usePathname } from "next/navigation";
import { Package, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/** Account section links; highlights the current page. Render inside <Suspense> (reads the pathname). */
export function AccountNav() {
  return <AccountNavList pathname={stripLocale(usePathname())} />;
}

/** Same links without an active page, used as the <Suspense> fallback. */
export function AccountNavList({ pathname }: { pathname: string | null }) {
  const t = useT().account.nav;
  const navItems = [
    { href: "/account/orders", label: t.orders, icon: Package },
    { href: "/account/addresses", label: t.addresses, icon: MapPin },
    { href: "/account/profile", label: t.profile, icon: User },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border md:flex-col md:gap-0.5 md:border-b-0">
      {navItems.map((item) => {
        const isActive = pathname?.startsWith(item.href) ?? false;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-200 md:rounded-md",
              isActive
                ? "text-primary md:bg-accent"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <item.icon className="size-4" strokeWidth={1.75} />
            {item.label}
            {isActive && (
              <span
                aria-hidden
                className="absolute inset-x-3 -bottom-px h-0.5 bg-primary animate-in fade-in-0 md:inset-x-auto md:inset-y-2 md:left-0 md:bottom-auto md:h-auto md:w-0.5"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
