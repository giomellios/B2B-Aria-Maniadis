import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getT } from "@/lib/i18n/server";
import { Button } from "@/design-system";
import { Minus, Plus, X } from "@/design-system/icons";
import { Price } from "@/components/shared/price";
import { removeFromCart, adjustQuantity } from "@/features/cart/services/cart.actions";

import { getOrderLineImagePreview } from "@/lib/utils";

type ActiveOrder = {
  id: string;
  currencyCode: string;
  lines: Array<{
    id: string;
    quantity: number;
    unitPriceWithTax: number;
    linePriceWithTax: number;
    productVariant: {
      id: string;
      name: string;
      sku: string;
      featuredAsset?: {
        preview: string;
      } | null;
      product: {
        name: string;
        slug: string;
        featuredAsset?: {
          preview: string;
        } | null;
      };
    };
  }>;
};

export async function CartItems({ activeOrder }: { activeOrder: ActiveOrder | null }) {
  const t = await getT();
  if (!activeOrder || activeOrder.lines.length === 0) {
    return (
      <div className="rounded-xl bg-card px-6 py-10">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">{t.cart.emptyTitle}</h2>
        <p className="mt-2 text-base text-muted-foreground">{t.cart.emptyText}</p>
        <Button className="mt-6" asChild>
          <Link href="/search">{t.cart.browse}</Link>
        </Button>
      </div>
    );
  }

  const pieces = activeOrder.lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <section className="lg:col-span-2" aria-label={t.cart.title}>
      <div className="flex items-baseline justify-between pb-3 text-sm text-muted-foreground">
        <span>{t.cart.product}</span>
        <span className="tabular-nums">{t.cart.lineCount(activeOrder.lines.length, pieces)}</span>
      </div>
      <ul>
        {activeOrder.lines.map((line) => {
          const imagePreview = getOrderLineImagePreview(line.productVariant);
          const href = `/product/${line.productVariant.product.slug}`;
          const code = line.productVariant.sku.split("-")[0];
          return (
            <li
              key={line.id}
              className="grid grid-cols-[56px_1fr_auto] items-center gap-x-4 gap-y-3 border-t border-border py-4 sm:grid-cols-[64px_1fr_auto_auto]"
            >
              <Link
                href={href}
                className="block size-14 overflow-hidden rounded-md bg-white sm:size-16"
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt={line.productVariant.name}
                    width={64}
                    height={64}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center bg-card text-sm font-semibold">
                    {code}
                  </span>
                )}
              </Link>

              <div className="min-w-0">
                <Link
                  href={href}
                  className="block truncate text-base font-medium hover:underline hover:decoration-gold hover:decoration-2 hover:underline-offset-4"
                >
                  {line.productVariant.product.name}
                </Link>
                <p className="truncate text-sm tabular-nums text-muted-foreground">
                  {line.productVariant.sku} ·{" "}
                  <Price value={line.unitPriceWithTax} currencyCode={activeOrder.currencyCode} />{" "}
                  {t.common.each}
                </p>
              </div>

              <div className="col-start-2 flex items-center gap-1 sm:col-start-auto">
                <form
                  action={async () => {
                    "use server";
                    await adjustQuantity(line.id, Math.max(1, line.quantity - 1));
                  }}
                >
                  <Button
                    type="submit"
                    variant="secondary"
                    size="icon"
                    className="size-10"
                    aria-label={t.product.decrease}
                    disabled={line.quantity <= 1}
                  >
                    <Minus className="size-4" />
                  </Button>
                </form>
                <span className="w-12 text-center text-base font-semibold tabular-nums">
                  {line.quantity}
                </span>
                <form
                  action={async () => {
                    "use server";
                    await adjustQuantity(line.id, line.quantity + 1);
                  }}
                >
                  <Button
                    type="submit"
                    variant="secondary"
                    size="icon"
                    className="size-10"
                    aria-label={t.product.increase}
                  >
                    <Plus className="size-4" />
                  </Button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await removeFromCart(line.id);
                  }}
                >
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="ml-2 size-10 text-muted-foreground hover:text-destructive"
                    aria-label={t.cart.remove}
                  >
                    <X className="size-5" />
                  </Button>
                </form>
              </div>

              <p className="row-start-1 col-start-3 text-right text-base font-semibold tabular-nums sm:col-start-auto sm:row-start-auto sm:min-w-24">
                <Price value={line.linePriceWithTax} currencyCode={activeOrder.currencyCode} />
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
