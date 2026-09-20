"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/**
 * Password field with a hold-to-reveal toggle: press and hold the eye icon to
 * briefly see the password, release to hide it again. Forwards all native input
 * props (and ref) so it works with react-hook-form's `{...field}` spread.
 */
function PasswordInput({ className, disabled, ...props }: React.ComponentProps<"input">) {
  const [reveal, setReveal] = React.useState(false);

  const show = () => setReveal(true);
  const hide = () => setReveal(false);

  return (
    <div className="relative">
      <Input
        type={reveal ? "text" : "password"}
        className={cn("pr-10", className)}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        aria-label={reveal ? "Hide password" : "Show password"}
        aria-pressed={reveal}
        onPointerDown={show}
        onPointerUp={hide}
        onPointerLeave={hide}
        onPointerCancel={hide}
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 transition-colors outline-none disabled:pointer-events-none disabled:opacity-50"
      >
        {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export { PasswordInput };
