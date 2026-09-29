import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { CheckoutFlow, CheckoutProvider } from "@/features/checkout";
import { noIndexRobots } from "@/lib/utils";
import { getActiveCustomer } from "@/features/auth/server";
import { getCheckoutData } from "@/features/checkout/server";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase.",
  robots: noIndexRobots(),
};

export default async function CheckoutPage() {
  await connection();
  const customer = await getActiveCustomer();
  const isGuest = !customer;

  const { activeOrder, addresses, countries, shippingMethods, paymentMethods } =
    await getCheckoutData({ isGuest });

  if (!activeOrder || activeOrder.lines.length === 0) {
    return redirect("/cart");
  }

  if (activeOrder.state !== "AddingItems" && activeOrder.state !== "ArrangingPayment") {
    return redirect(`/order-confirmation/${activeOrder.code}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <CheckoutProvider
        order={activeOrder}
        addresses={addresses}
        countries={countries}
        shippingMethods={shippingMethods}
        paymentMethods={paymentMethods}
        isGuest={isGuest}
      >
        <CheckoutFlow />
      </CheckoutProvider>
    </div>
  );
}
