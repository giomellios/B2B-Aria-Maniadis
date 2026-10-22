"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/design-system";
import { Spinner } from "@/design-system/icons";
import { addToCart } from "@/features/cart";
import { useLocaleRouter } from "@/lib/i18n/navigation";
import { useT } from "@/lib/i18n/provider";

/** Adds every line of a past order to the cart again, then opens the cart. */
export function ReorderButton({ lines }: { lines: { variantId: string; quantity: number }[] }) {
  const t = useT().account.orders;
  const router = useLocaleRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          // One at a time, so every line lands on the same order.
          let added = 0;
          let failed = false;
          for (const line of lines) {
            const result = await addToCart(line.variantId, line.quantity);
            if (result.success) added += line.quantity;
            else failed = true;
          }
          if (added) toast.success(t.againDone(added));
          if (failed) toast.error(t.againPartial);
          if (added) router.push("/cart");
        })
      }
    >
      {isPending && <Spinner className="size-4 animate-spin" />}
      {isPending ? t.againAdding : t.again}
    </Button>
  );
}
