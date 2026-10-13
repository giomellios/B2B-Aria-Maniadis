"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/design-system";
import { Link } from "@/lib/i18n/navigation";
import { useT } from "@/lib/i18n/provider";

interface CartIconProps {
  cartItemCount: number;
}

export function CartIcon({ cartItemCount }: CartIconProps) {
  const t = useT();
  return (
    <Button variant="ghost" size="icon" asChild className="group relative">
      <Link href="/cart">
        <ShoppingBag
          className="size-5 transition-transform duration-300 ease-out group-hover:-translate-y-px"
          strokeWidth={1.5}
        />
        {cartItemCount > 0 && (
          // Keyed on the count so the pop replays whenever items are added
          <span
            key={cartItemCount}
            className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] animate-[badge-pop_0.4s_var(--ease-out-quint)] items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold tabular-nums text-primary-foreground ring-2 ring-background"
          >
            {cartItemCount}
          </span>
        )}
        <span className="sr-only">{t.nav.cart}</span>
      </Link>
    </Button>
  );
}
