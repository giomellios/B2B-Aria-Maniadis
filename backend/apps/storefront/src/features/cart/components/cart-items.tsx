import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getT } from "@/lib/i18n/server";
import { Button } from "@/design-system";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
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
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="mx-auto mb-6 size-10 text-primary" strokeWidth={1.25} />
          <h2 className="display text-4xl md:text-5xl mb-4">{t.cart.emptyTitle}</h2>
          <p className="text-muted-foreground mb-8">{t.cart.emptyText}</p>
          <Button asChild>
            <Link href="/search">{t.cart.browse}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 space-y-4">
      {activeOrder.lines.map((line) => {
        const imagePreview = getOrderLineImagePreview(line.productVariant);
        return (
          <div
            key={line.id}
            className="flex flex-col sm:flex-row gap-5 p-4 border rounded-md bg-card animate-in fade-in-0 duration-300"
          >
            {imagePreview && (
              <Link href={`/product/${line.productVariant.product.slug}`} className="flex-shrink-0">
                <Image
                  src={imagePreview}
                  alt={line.productVariant.name}
                  width={120}
                  height={120}
                  className="rounded-sm border border-border bg-white object-cover w-full sm:w-[120px] h-[120px] transition-opacity hover:opacity-85"
                />
              </Link>
            )}

            <div className="flex-grow min-w-0">
              <Link
                href={`/product/${line.productVariant.product.slug}`}
                className="block font-serif text-lg leading-snug transition-colors hover:text-primary"
              >
                {line.productVariant.product.name}
              </Link>
              {line.productVariant.name !== line.productVariant.product.name && (
                <p className="text-sm text-muted-foreground mt-1">{line.productVariant.name}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {t.common.sku}: {line.productVariant.sku}
              </p>
              <p className="text-sm text-muted-foreground mt-2 sm:hidden">
                <Price value={line.unitPriceWithTax} currencyCode={activeOrder.currencyCode} />{" "}
                {t.common.each}
              </p>

              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-2 border rounded-md">
                  <form
                    action={async () => {
                      "use server";
                      await adjustQuantity(line.id, Math.max(1, line.quantity - 1));
                    }}
                  >
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-none"
                      disabled={line.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </form>

                  <span className="w-12 text-center font-medium">{line.quantity}</span>

                  <form
                    action={async () => {
                      "use server";
                      await adjustQuantity(line.id, line.quantity + 1);
                    }}
                  >
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-none"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </form>
                </div>

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
                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </form>

                <div className="sm:hidden ml-auto">
                  <p className="font-semibold text-lg">
                    <Price value={line.linePriceWithTax} currencyCode={activeOrder.currencyCode} />
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-right flex-shrink-0">
              <p className="font-semibold text-lg">
                <Price value={line.linePriceWithTax} currencyCode={activeOrder.currencyCode} />
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <Price value={line.unitPriceWithTax} currencyCode={activeOrder.currencyCode} />{" "}
                {t.common.each}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
