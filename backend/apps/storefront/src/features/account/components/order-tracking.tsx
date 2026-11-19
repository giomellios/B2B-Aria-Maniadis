"use client";

import { toast } from "sonner";
import { ArrowUpRight, Copy, Truck } from "@/design-system/icons";
import { useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/** Shop API Order.tracking: built on the server from the admin's tracking number + carrier page. */
export interface OrderTrackingData {
  trackingNumber: string;
  carrier?: string | null;
  url?: string | null;
  urlIncludesNumber: boolean;
}

/**
 * The shipment's tracking number with a link to the carrier's tracking page. When the carrier's
 * link cannot open the shipment directly, the customer copies the number and searches there.
 */
export function OrderTracking({
  tracking,
  className,
}: {
  tracking: OrderTrackingData;
  className?: string;
}) {
  const t = useT().account.order.tracking;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tracking.trackingNumber);
      toast.success(t.copied);
    } catch {
      // Clipboard blocked: the number is on screen and selectable anyway.
    }
  };

  return (
    <div className={cn("space-y-2 text-sm", className)}>
      <p className="text-muted-foreground">{t.number}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="select-all font-mono text-base font-semibold tracking-wide">
          {tracking.trackingNumber}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-field-hover hover:text-foreground"
        >
          <Copy className="size-4" />
          {t.copy}
        </button>
      </div>
      {tracking.url && (
        <>
          <a
            href={tracking.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-foreground underline decoration-gold decoration-2 underline-offset-4"
          >
            <Truck className="size-4" />
            {t.track(tracking.carrier ?? null)}
            <ArrowUpRight className="size-3.5" />
          </a>
          {!tracking.urlIncludesNumber && <p className="text-muted-foreground">{t.pasteHint}</p>}
        </>
      )}
    </div>
  );
}

/** Compact version for the order list: a link to the carrier's page, or just the number. */
export function OrderTrackingLink({ tracking }: { tracking: OrderTrackingData }) {
  const t = useT().account.order.tracking;
  if (!tracking.url) {
    return (
      <span
        title={t.number}
        className="mt-1 inline-flex items-center gap-1 font-mono text-sm text-muted-foreground"
      >
        <Truck className="size-3.5" />
        {tracking.trackingNumber}
      </span>
    );
  }
  return (
    <a
      href={tracking.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${t.number}: ${tracking.trackingNumber}`}
      className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <Truck className="size-3.5" />
      {t.short}
      <ArrowUpRight className="size-3" />
    </a>
  );
}
