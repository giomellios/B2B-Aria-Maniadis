import { cacheLife, cacheTag } from "next/cache";
import { CartIcon } from "@/features/cart/components/cart-icon";
import { getCartItemCount } from "@/features/cart/services/cart.service";

export async function NavbarCart() {
  "use cache: private";
  cacheLife("minutes");
  cacheTag("cart");
  cacheTag("active-order");

  const cartItemCount = await getCartItemCount();
  return <CartIcon cartItemCount={cartItemCount} />;
}
