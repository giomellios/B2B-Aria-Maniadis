import type { Metadata } from "next";
import { connection } from "next/server";
import { localeRedirect } from "@/lib/i18n/redirect";
import { getT } from "@/lib/i18n/server";
import { CheckoutFlow, CheckoutProvider } from "@/features/checkout";
import { noIndexRobots } from "@/lib/utils";
import { requireActiveCustomer } from "@/features/auth/server";
import { getCheckoutData } from "@/features/checkout/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.checkout.title, robots: noIndexRobots() };
}

export default async function CheckoutPage() {
  await connection();
  // Only signed-in customers can order, so the checkout never runs as a guest
  await requireActiveCustomer("/checkout");

  const { activeOrder, addresses, countries, shippingMethods, paymentMethods } =
    await getCheckoutData({ isGuest: false });

  if (!activeOrder || activeOrder.lines.length === 0) {
    return localeRedirect("/cart");
  }

  if (activeOrder.state !== "AddingItems" && activeOrder.state !== "ArrangingPayment") {
    return localeRedirect(`/order-confirmation/${activeOrder.code}`);
  }

  return (
    <div className="frame mt-header pt-8 pb-20">
      <h1 className="display text-4xl md:text-5xl mb-8">{(await getT()).checkout.title}</h1>
      <CheckoutProvider
        order={activeOrder}
        addresses={addresses}
        countries={countries}
        shippingMethods={shippingMethods}
        paymentMethods={paymentMethods}
        isGuest={false}
      >
        <CheckoutFlow />
      </CheckoutProvider>
    </div>
  );
}
