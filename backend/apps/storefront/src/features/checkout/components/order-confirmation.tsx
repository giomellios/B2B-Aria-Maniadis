import { getOrderByCode } from "@/features/checkout/services/checkout.service";
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from "@/design-system";
import { Check } from "@/design-system/icons";
import { Link } from "@/lib/i18n/navigation";
import { getT } from "@/lib/i18n/server";
import Image from "next/image";
import { Price } from "@/components/shared/price";
import { notFound } from "next/navigation";

import { getOrderLineImagePreview } from "@/lib/utils";
import { requireActiveCustomer } from "@/features/auth/server";

export async function OrderConfirmation({
  params,
}: PageProps<"/[locale]/order-confirmation/[code]">) {
  const [{ code }, t] = await Promise.all([params, getT()]);
  await requireActiveCustomer(`/order-confirmation/${code}`);
  let order;

  try {
    order = await getOrderByCode(code);
  } catch {
    notFound();
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="frame mt-header pt-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground animate-in zoom-in-50 fade-in-0 duration-500">
            <Check className="size-8" weight="bold" />
          </span>
          <h1 className="display text-[1.75rem] md:text-[2rem] mb-3 animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both delay-150 duration-500">
            {t.orderConfirmation.title}
          </h1>
          <p className="text-muted-foreground">
            {t.orderConfirmation.thanks} <span className="font-semibold">{order.code}</span>
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t.orderConfirmation.items}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.lines.map((line) => {
              const imagePreview = getOrderLineImagePreview(line.productVariant);
              return (
                <div key={line.id} className="flex gap-4 items-center">
                  {imagePreview && (
                    <div className="flex-shrink-0">
                      <Image
                        src={imagePreview}
                        alt={line.productVariant.name}
                        width={80}
                        height={80}
                        className="rounded object-cover h-20 w-20 object-center"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{line.productVariant.product.name}</p>
                    {line.productVariant.name !== line.productVariant.product.name && (
                      <p className="text-sm text-muted-foreground">{line.productVariant.name}</p>
                    )}
                  </div>
                  <div className="text-center w-16">
                    <p className="text-sm text-muted-foreground">{t.common.qty}</p>
                    <p className="font-medium">{line.quantity}</p>
                  </div>
                  <div className="text-right w-24">
                    <p className="font-semibold">
                      <Price value={line.linePriceWithTax} currencyCode={order.currencyCode} />
                    </p>
                  </div>
                </div>
              );
            })}

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>{t.common.total}</span>
              <span>
                <Price value={order.totalWithTax} currencyCode={order.currencyCode} />
              </span>
            </div>
          </CardContent>
        </Card>

        {order.shippingAddress && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t.orderConfirmation.shippingAddress}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {order.shippingAddress.streetLine1}
                {order.shippingAddress.streetLine2 && `, ${order.shippingAddress.streetLine2}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-sm text-muted-foreground">{order.shippingAddress.country}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button asChild className="flex-1">
            <Link href="/">{t.orderConfirmation.continueShopping}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
