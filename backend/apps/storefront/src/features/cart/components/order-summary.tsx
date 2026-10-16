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
    <div className="border rounded-md p-6 bg-card sticky top-sticky">
      <h2 className="font-serif text-2xl mb-4">{t.cart.summary}</h2>

      <OrderTotalsBreakdown
        order={activeOrder}
        shippingFallback={t.cart.shippingAtCheckout}
        className="space-y-2 mb-4"
      />

      <div className="border-t pt-4 mb-6">
        <OrderGrandTotal order={activeOrder} />
      </div>

      <Button className="w-full" size="lg" asChild>
        <Link href="/checkout">{t.cart.checkout}</Link>
      </Button>

      <Button variant="outline" className="w-full mt-2" asChild>
        <Link href="/">{t.cart.continueShopping}</Link>
      </Button>
    </div>
  );
}
