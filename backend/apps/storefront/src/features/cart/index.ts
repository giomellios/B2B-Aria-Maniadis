// Public, client-safe API of the cart feature.
// Server-only exports (data loaders, async server components) live in ./server.ts.
export { CartSkeleton } from "@/features/cart/components/cart-skeleton";
export { addToCart } from "@/features/cart/services/cart.actions";
