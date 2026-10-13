import type { Metadata } from "next";
import { Cart } from "@/features/cart/server";
import { Suspense } from "react";
import { CartSkeleton } from "@/features/cart";
import { noIndexRobots } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.cart.title, robots: noIndexRobots() };
}

export default async function CartPage() {
  const t = await getT();
  return (
    <div className="container mx-auto mt-16 px-4 pt-12 pb-20 md:pt-16">
      <h1 className="display text-4xl md:text-5xl mb-8">{t.cart.title}</h1>

      <Suspense fallback={<CartSkeleton />}>
        <Cart />
      </Suspense>
    </div>
  );
}
