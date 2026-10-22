"use client";

import { useState, useTransition } from "react";
import { useLocaleRouter } from "@/lib/i18n/navigation";
import { Button, Input, Label } from "@/design-system";
import { Spinner } from "@/design-system/icons";
import { findByCode } from "@/features/cart/services/cart.actions";
import { useT } from "@/lib/i18n/provider";

/** Type a code from the printed catalogue and land on that product's order matrix. */
export function QuickOrder() {
  const t = useT().cart.quick;
  const router = useLocaleRouter();
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!code.trim()) return;
        startTransition(async () => router.push(await findByCode(code)));
      }}
    >
      <div className="min-w-0 flex-1 space-y-2 sm:max-w-xs">
        <Label htmlFor="quick-code">{t.label}</Label>
        <Input
          id="quick-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t.placeholder}
          autoComplete="off"
          spellCheck={false}
          className="uppercase placeholder:normal-case"
        />
      </div>
      <Button type="submit" size="lg" className="h-11" disabled={isPending || !code.trim()}>
        {isPending && <Spinner className="size-4 animate-spin" />}
        {t.go}
      </Button>
      <p className="basis-full text-sm text-muted-foreground">{t.hint}</p>
    </form>
  );
}
