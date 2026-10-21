"use client";

import { Link } from "@/lib/i18n/navigation";
import { stripLocale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/provider";
import { usePathname } from "next/navigation";
import { Package, User, MapPin } from "@/design-system/icons";
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
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5">
      {navItems.map((item) => {
        const isActive = pathname?.startsWith(item.href) ?? false;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex h-11 shrink-0 items-center gap-3 rounded-md px-3 text-base transition-colors duration-200",
              isActive ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
