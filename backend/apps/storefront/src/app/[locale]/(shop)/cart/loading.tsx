import { CartSkeleton } from "@/features/cart";

export default function CartLoading() {
  return (
    <div className="frame mt-header pt-8 pb-20">
      <div className="h-9 w-48 bg-muted animate-pulse rounded mb-8" />
      <CartSkeleton />
    </div>
  );
}
