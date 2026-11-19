"use client";

import { ComponentProps, useTransition } from "react";
import { logoutAction } from "@/features/auth/services/sign-in.actions";
import { useLocaleRouter } from "@/lib/i18n/navigation";
import { useT } from "@/lib/i18n/provider";

interface LoginButtonProps extends ComponentProps<"button"> {
  isLoggedIn: boolean;
}

/** Sign-in / sign-out button. `children` (e.g. an icon) are rendered before the label. */
export function LoginButton({ isLoggedIn, children, ...props }: LoginButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useLocaleRouter();
  const t = useT();

  return (
    <button
      type="button"
      {...props}
      aria-disabled={isPending}
      onClick={() => {
        if (isLoggedIn) {
          startTransition(async () => {
            await logoutAction();
          });
        } else {
          router.push("/sign-in");
        }
      }}
    >
      {children}
      {isLoggedIn ? t.nav.signOut : t.nav.signIn}
    </button>
  );
}
