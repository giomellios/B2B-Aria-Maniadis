"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, IdCard, SignOut, User } from "@/design-system/icons";
import { LoginButton } from "@/features/auth";
import { Link } from "@/lib/i18n/navigation";
import { stripLocale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const PROFILE_HREF = "/account/profile";

const itemClass =
  "flex h-10 w-full items-center gap-2.5 rounded-sm px-3 text-left text-base text-foreground outline-none transition-colors duration-150 hover:bg-accent focus-visible:bg-accent [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";

/**
 * "Profile" in the bar only opens a small menu (on hover, or when focused): "Information" goes to
 * the profile page and "Sign out" signs out. "Profile" itself never navigates. On the profile page,
 * "Information" is shown as the current page and doesn't navigate either (no refetch of the page).
 */
export function AccountMenu({ triggerClassName }: { triggerClassName?: string }) {
  const t = useT().nav;
  const onProfile = stripLocale(usePathname()) === PROFILE_HREF;

  return (
    <div className="group/account relative">
      {/* A button (not a link), so it can be focused to open the menu but goes nowhere itself. */}
      <button
        type="button"
        aria-haspopup="true"
        aria-current={onProfile ? "page" : undefined}
        className={cn(triggerClassName, "cursor-default gap-1.5")}
      >
        <User className="size-5" />
        {t.profile}
        <ChevronDown className="size-3.5 transition-transform duration-200 group-hover/account:rotate-180 group-focus-within/account:rotate-180" />
      </button>

      {/* pt-2 bridges the gap below the trigger so the pointer can travel into the panel. */}
      <div className="invisible absolute top-full right-0 z-50 pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover/account:visible group-hover/account:opacity-100 group-focus-within/account:visible group-focus-within/account:opacity-100">
        <ul className="min-w-52 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <li>
            {onProfile ? (
              <span aria-current="page" className={cn(itemClass, "cursor-default font-medium")}>
                <IdCard />
                {t.information}
              </span>
            ) : (
              <Link href={PROFILE_HREF} className={itemClass}>
                <IdCard />
                {t.information}
              </Link>
            )}
          </li>
          <li className="-mx-1 my-1 h-px bg-border" aria-hidden />
          <li>
            <LoginButton isLoggedIn className={itemClass}>
              <SignOut />
            </LoginButton>
          </li>
        </ul>
      </div>
    </div>
  );
}
