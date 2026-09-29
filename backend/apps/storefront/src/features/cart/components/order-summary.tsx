import Link from "next/link";
import { Button } from "@/design-system";
import {
  OrderGrandTotal,
  OrderTotalsBreakdown,
  type OrderTotalsData,
} from "@/components/shared/order-totals";

export function OrderSummary({ activeOrder }: { activeOrder: OrderTotalsData }) {
  return (
    <div className="border rounded-lg p-6 bg-card sticky top-4">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <OrderTotalsBreakdown
        order={activeOrder}
        shippingFallback="Calculated at checkout"
        className="space-y-2 mb-4"
      />

      <div className="border-t pt-4 mb-6">
        <OrderGrandTotal order={activeOrder} />
      </div>

      <Button className="w-full" size="lg" asChild>
        <Link href="/checkout">Proceed to Checkout</Link>
      </Button>

      <Button variant="outline" className="w-full mt-2" asChild>
        <Link href="/">Continue Shopping</Link>
      </Button>
    </div>
  );
}
