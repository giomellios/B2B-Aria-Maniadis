"use server";

import { mutate } from "@/lib/api/client";
import {
  AddToCartMutation,
  RemoveFromCartMutation,
  AdjustCartItemMutation,
  ApplyPromotionCodeMutation,
  RemovePromotionCodeMutation,
} from "@/features/cart/services/mutations";
import { updateTag } from "next/cache";
import { setAuthToken } from "@/lib/api/auth-token";

export async function addToCart(variantId: string, quantity: number = 1) {
  try {
    const result = await mutate(AddToCartMutation, { variantId, quantity }, { useAuthToken: true });

    if (result.token) {
      await setAuthToken(result.token);
    }

    if (result.data.addItemToOrder.__typename === "Order") {
      // Revalidate cart data across all pages
      updateTag("cart");
      updateTag("active-order");
      return { success: true, order: result.data.addItemToOrder };
    } else {
      return { success: false, error: result.data.addItemToOrder.message };
    }
  } catch {
    return { success: false, error: "Failed to add item to cart" };
  }
}

export async function removeFromCart(lineId: string) {
  await mutate(RemoveFromCartMutation, { lineId }, { useAuthToken: true });
  updateTag("cart");
}

export async function adjustQuantity(lineId: string, quantity: number) {
  await mutate(AdjustCartItemMutation, { lineId, quantity }, { useAuthToken: true });
  updateTag("cart");
}

export async function applyPromotionCode(formData: FormData) {
  const code = formData.get("code") as string;
  if (!code) return;

  await mutate(ApplyPromotionCodeMutation, { couponCode: code }, { useAuthToken: true });
  updateTag("cart");
}

export async function removePromotionCode(formData: FormData) {
  const code = formData.get("code") as string;
  if (!code) return;

  await mutate(RemovePromotionCodeMutation, { couponCode: code }, { useAuthToken: true });
  updateTag("cart");
}
