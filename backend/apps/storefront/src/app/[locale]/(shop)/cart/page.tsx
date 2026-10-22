import type { Metadata } from "next";
import { Cart } from "@/features/cart/server";
import { Suspense } from "react";
import { CartSkeleton, QuickOrder } from "@/features/cart";
import { noIndexRobots } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.cart.title, robots: noIndexRobots() };
}

export default async function CartPage() {
  const t = await getT();
  return (
    <div className="frame mt-header pt-8 pb-20">
      <div className="mb-8 grid gap-6 lg:grid-cols-3 lg:gap-10">
        <h1 className="display text-[1.75rem] md:text-[2rem] lg:col-span-1">{t.cart.title}</h1>
        <div className="lg:col-span-2">
          <h2 className="sr-only">{t.cart.quick.title}</h2>
          <QuickOrder />
        </div>
      </div>

      <Suspense fallback={<CartSkeleton />}>
        <Cart />
      </Suspense>
    </div>
  );
}
