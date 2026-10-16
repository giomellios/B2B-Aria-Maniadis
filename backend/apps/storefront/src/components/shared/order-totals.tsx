import { Price } from "@/components/shared/price";
import { Msg } from "@/lib/i18n/msg";

export type OrderTotalsData = {
  currencyCode: string;
  subTotalWithTax: number;
  shippingWithTax: number;
  totalWithTax: number;
  discounts?: ReadonlyArray<{
    description: string;
    amountWithTax: number;
  }> | null;
};

/** Subtotal, discount and shipping rows shared by the cart and checkout summaries. */
export function OrderTotalsBreakdown({
  order,
  shippingFallback,
  className = "space-y-2",
}: {
  order: OrderTotalsData;
  /** Shown instead of the shipping price while no shipping method is set. */
  shippingFallback: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          <Msg k="common.subtotal" />
        </span>
        <span>
          <Price value={order.subTotalWithTax} currencyCode={order.currencyCode} />
        </span>
      </div>
      {order.discounts?.map((discount, index) => (
        <div key={index} className="flex justify-between text-sm text-success">
          <span>{discount.description}</span>
          <span>
            <Price value={discount.amountWithTax} currencyCode={order.currencyCode} />
          </span>
        </div>
      ))}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          <Msg k="common.shipping" />
        </span>
        <span>
          {order.shippingWithTax > 0 ? (
            <Price value={order.shippingWithTax} currencyCode={order.currencyCode} />
          ) : (
            shippingFallback
          )}
        </span>
      </div>
    </div>
  );
}

export function OrderGrandTotal({ order }: { order: OrderTotalsData }) {
  return (
    <div className="flex justify-between font-semibold text-lg">
      <span>
        <Msg k="common.total" />
      </span>
      <span>
        <Price value={order.totalWithTax} currencyCode={order.currencyCode} />
      </span>
    </div>
  );
}
