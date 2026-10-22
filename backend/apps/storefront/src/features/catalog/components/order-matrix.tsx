"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/design-system";
import { Check, Spinner } from "@/design-system/icons";
import { addToCart } from "@/features/cart";
import { Price } from "@/components/shared/price";
import { useT } from "@/lib/i18n/provider";
import { format } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  code: string;
  name: string;
}

interface Variant {
  id: string;
  sku: string;
  currencyCode: string;
  priceWithTax: number;
  stockLevel: string;
  options: Array<{ id: string; group: { code: string } }>;
}

export interface OrderMatrixProps {
  /** The first option group runs down the rows (colour), the second across (finish), if any. */
  rows: { code: string; name: string; options: Option[] };
  columns?: { code: string; name: string; options: Option[] };
  variants: Variant[];
}

/**
 * The B2B way to order one product code: every colour × finish as a cell with a quantity, and one
 * action that adds the whole mixed run (one order line per cell) through the same addToCart call.
 * Focusing a cell also selects its options in the URL, so the gallery shows that variant's picture.
 */
export function OrderMatrix({ rows, columns, variants }: OrderMatrixProps) {
  const t = useT();
  const m = t.product.matrix;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState<number | null>(null);

  const cols = columns?.options ?? [null];
  const variantAt = (row: Option, col: Option | null) =>
    variants.find(
      (v) =>
        v.options.some((o) => o.id === row.id) && (!col || v.options.some((o) => o.id === col.id))
    );

  const currencyCode = variants[0]?.currencyCode;
  const prices = variants.map((v) => v.priceWithTax);
  const minPrice = Math.min(...prices);
  const samePrice = prices.every((p) => p === minPrice);

  const chosen = useMemo(
    () =>
      variants
        .map((v) => ({ variant: v, qty: quantities[v.id] ?? 0 }))
        .filter(({ qty }) => qty > 0),
    [variants, quantities]
  );
  const pieces = chosen.reduce((sum, { qty }) => sum + qty, 0);
  const total = chosen.reduce((sum, { variant, qty }) => sum + variant.priceWithTax * qty, 0);

  const select = (row: Option, col: Option | null) => {
    const params = new URLSearchParams(searchParams);
    params.set(rows.code, row.code);
    if (columns && col) params.set(columns.code, col.code);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const addAll = () =>
    startTransition(async () => {
      // One at a time, so every line lands on the same order (the first call may open it).
      let added = 0;
      let failed: string | undefined;
      for (const { variant, qty } of chosen) {
        const result = await addToCart(variant.id, qty);
        if (result.success) added += qty;
        else failed = result.error;
      }
      if (added) {
        toast.success(m.added(added));
        setQuantities({});
        setJustAdded(added);
        setTimeout(() => setJustAdded(null), 2500);
      }
      if (failed) toast.error(m.partial, { description: failed });
    });

  return (
    <section aria-labelledby="matrix-title" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="matrix-title" className="text-base font-semibold">
          {m.title}
        </h2>
        <p className="text-sm tabular-nums text-muted-foreground">
          {samePrice ? (
            <>
              <span className="text-foreground">
                <Price value={minPrice} currencyCode={currencyCode} />
              </span>{" "}
              {m.perPiece}
            </>
          ) : (
            <PriceFrom value={minPrice} template={m.fromPerPiece} currencyCode={currencyCode} />
          )}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">{m.hint}</p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-base">
          <thead>
            <tr>
              <th
                scope="col"
                className="h-10 pr-4 text-left text-sm font-normal text-muted-foreground"
              >
                {rows.name}
              </th>
              {cols.map((col) => (
                <th
                  key={col?.id ?? "qty"}
                  scope="col"
                  className="h-10 px-1 text-right text-sm font-normal text-muted-foreground"
                >
                  {col?.name ?? t.common.qty}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.options.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <th scope="row" className="py-2 pr-4 text-left font-medium">
                  {row.name}
                </th>
                {cols.map((col) => {
                  const variant = variantAt(row, col);
                  const label = format(m.cellLabel, { colour: row.name, finish: col?.name ?? "" });
                  if (!variant) {
                    return (
                      <td
                        key={col?.id ?? "qty"}
                        className="px-1 py-2 text-right text-muted-foreground"
                        title={m.unavailable}
                      >
                        <span aria-label={m.unavailable}>—</span>
                      </td>
                    );
                  }
                  const out = variant.stockLevel === "OUT_OF_STOCK";
                  const qty = quantities[variant.id] ?? 0;
                  return (
                    <td key={variant.id} className="px-1 py-2 text-right">
                      {out ? (
                        <span className="text-sm text-muted-foreground">{m.out}</span>
                      ) : (
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          aria-label={label}
                          title={variant.sku}
                          value={qty || ""}
                          placeholder="0"
                          onFocus={() => select(row, col)}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setQuantities((prev) => ({
                              ...prev,
                              [variant.id]: Number(digits) || 0,
                            }));
                          }}
                          className={cn(
                            "h-11 w-16 rounded-md bg-field px-2 text-right tabular-nums outline-none transition-colors placeholder:text-muted-foreground/70 hover:bg-field-hover focus-visible:bg-field-hover focus-visible:ring-2 focus-visible:ring-ring/60",
                            qty > 0 && "bg-field-hover font-semibold text-gold"
                          )}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card p-4">
        <p className="text-base tabular-nums" aria-live="polite">
          {pieces ? (
            <>
              <span className="font-semibold">{m.summary(pieces, chosen.length)}</span>
              <span className="text-muted-foreground"> · </span>
              <span title={m.estimate}>
                ≈ <Price value={total} currencyCode={currencyCode} />
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">{m.empty}</span>
          )}
        </p>
        <div className="flex items-center gap-3">
          {pieces > 0 && !isPending && (
            <button
              type="button"
              onClick={() => setQuantities({})}
              className="link-underline text-sm text-muted-foreground"
            >
              {m.clear}
            </button>
          )}
          <Button size="lg" disabled={!pieces || isPending} onClick={addAll}>
            {isPending ? (
              <>
                <Spinner className="size-5 animate-spin" />
                {m.adding}
              </>
            ) : justAdded ? (
              <>
                <Check className="size-5" />
                {m.added(justAdded)}
              </>
            ) : (
              m.add(pieces)
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}

function PriceFrom({
  value,
  template,
  currencyCode,
}: {
  value: number;
  template: string;
  currencyCode?: string;
}) {
  const [before, after] = template.split("{price}");
  return (
    <>
      {before}
      <span className="text-foreground">
        <Price value={value} currencyCode={currencyCode} />
      </span>
      {after}
    </>
  );
}
