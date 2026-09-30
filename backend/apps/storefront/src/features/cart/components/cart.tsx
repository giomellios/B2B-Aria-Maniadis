import { CartItems } from "@/features/cart/components/cart-items";
import { OrderSummary } from "@/features/cart/components/order-summary";
import { PromotionCode } from "@/features/cart/components/promotion-code";
import { getActiveOrder } from "@/features/cart/services/cart.service";

export async function Cart() {
  "use cache: private";

  const activeOrder = await getActiveOrder();

  // Handle empty cart case
  if (!activeOrder || activeOrder.lines.length === 0) {
    return <CartItems activeOrder={null} />;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <CartItems activeOrder={activeOrder} />

      <div className="lg:col-span-1">
        <OrderSummary activeOrder={activeOrder} />
        <PromotionCode activeOrder={activeOrder} />
      </div>
    </div>
  );
}
