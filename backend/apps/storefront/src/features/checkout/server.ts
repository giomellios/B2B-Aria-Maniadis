import "server-only";

// Server-only public API of the checkout feature: data loaders and
// async server components. Import from server components / pages only.
export { OrderConfirmation } from "@/features/checkout/components/order-confirmation";
export { getCheckoutData } from "@/features/checkout/services/checkout.service";
