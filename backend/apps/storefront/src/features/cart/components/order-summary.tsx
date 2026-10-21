import { Link } from "@/lib/i18n/navigation";
import { getT } from "@/lib/i18n/server";
import { Button } from "@/design-system";
import {
  OrderGrandTotal,
  OrderTotalsBreakdown,
  type OrderTotalsData,
} from "@/components/shared/order-totals";

export async function OrderSummary({ activeOrder }: { activeOrder: OrderTotalsData }) {
  const t = await getT();
  return (
    <div className="sticky top-sticky rounded-xl bg-card p-5">
      <h2 className="mb-4 text-base font-semibold">{t.cart.summary}</h2>

      <OrderTotalsBreakdown
        order={activeOrder}
        shippingFallback={t.cart.shippingAtCheckout}
        className="space-y-2 mb-4"
      />

      <div className="mb-6 border-t border-border pt-4">
        <OrderGrandTotal order={activeOrder} />
      </div>

      <Button className="w-full" size="lg" asChild>
        <Link href="/checkout">{t.cart.checkout}</Link>
      </Button>

      <Button variant="ghost" className="mt-2 w-full" asChild>
        <Link href="/search">{t.cart.continueShopping}</Link>
      </Button>
    </div>
  );
}
