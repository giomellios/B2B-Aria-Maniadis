"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/design-system";
import { Link } from "@/lib/i18n/navigation";
import { stripLocale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/provider";

const SIGN_IN_HREF = "/sign-in";
const SIGN_UP_HREF = "/register";

/**
 * Sign in / Sign up in the bar, for signed-out visitors only (signed-in customers get the profile
 * menu instead). The button for the page you're already on doesn't navigate (no refetch).
 * On phones only "Sign in" fits; "Sign up" is in the mobile menu.
 */
export function GuestActions() {
  const t = useT().nav;
  const path = stripLocale(usePathname());

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button variant="ghost" size="sm" asChild>
        {path === SIGN_IN_HREF ? (
          <span aria-current="page" className="cursor-default">
            {t.signIn}
          </span>
        ) : (
          <Link href={SIGN_IN_HREF}>{t.signIn}</Link>
        )}
      </Button>
      <Button variant="gold" size="sm" asChild className="hidden sm:inline-flex">
        {path === SIGN_UP_HREF ? (
          <span aria-current="page" className="cursor-default">
            {t.signUp}
          </span>
        ) : (
          <Link href={SIGN_UP_HREF}>{t.signUp}</Link>
        )}
      </Button>
    </div>
  );
}
