"use client";

import * as React from "react";
import { Eye, EyeOff } from "@/design-system/icons";
import { Input } from "@/design-system/forms/input";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/** A password field with an eye button that shows or hides what has been typed. */
function PasswordInput({
  className,
  disabled,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false);
  const t = useT().auth;

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        disabled={disabled}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? t.hidePassword : t.showPassword}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground outline-none transition-colors duration-200 hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50"
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}

export { PasswordInput };
