"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, Separator } from "@/design-system";
import { OrderLine } from "@/features/checkout/types";
import { useCheckout } from "@/features/checkout/hooks/use-checkout";
import { Price } from "@/components/shared/price";
import { OrderGrandTotal, OrderTotalsBreakdown } from "@/components/shared/order-totals";

export default function OrderSummary() {
  const { order } = useCheckout();
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {order.lines.map((line: OrderLine) => (
            <div key={line.id} className="flex gap-3">
              {line.productVariant.product.featuredAsset && (
                <div className="flex-shrink-0 w-15 h-15">
                  <Image
                    src={line.productVariant.product.featuredAsset.preview}
                    alt={line.productVariant.name}
                    width={60}
                    height={60}
                    className="rounded object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">
                  {line.productVariant.product.name}
                </p>
                {line.productVariant.name !== line.productVariant.product.name && (
                  <p className="text-xs text-muted-foreground">{line.productVariant.name}</p>
                )}
                <p className="text-xs text-muted-foreground">Qty: {line.quantity}</p>
              </div>
              <div className="text-sm font-medium">
                <Price value={line.linePriceWithTax} currencyCode={order.currencyCode} />
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <OrderTotalsBreakdown order={order} shippingFallback="To be calculated" />

        <Separator />

        <OrderGrandTotal order={order} />
      </CardContent>
    </Card>
  );
}
