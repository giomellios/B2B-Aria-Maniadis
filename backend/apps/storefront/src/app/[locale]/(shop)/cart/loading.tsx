import { CartSkeleton } from "@/features/cart";

export default function CartLoading() {
  return (
    <div className="container mx-auto mt-header px-4 pt-12 pb-20 md:pt-16">
      <div className="h-9 w-48 bg-muted animate-pulse rounded mb-8" />
      <CartSkeleton />
    </div>
  );
}
