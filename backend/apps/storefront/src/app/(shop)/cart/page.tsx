import type { Metadata } from "next";
import { Cart } from "@/features/cart/server";
import { Suspense } from "react";
import { CartSkeleton } from "@/features/cart";
import { noIndexRobots } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review items in your shopping cart.",
  robots: noIndexRobots(),
};

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <Suspense fallback={<CartSkeleton />}>
        <Cart />
      </Suspense>
    </div>
  );
}
