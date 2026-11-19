"use server";

import { mutate, query } from "@/lib/api/client";
import { ProductByCodeQuery } from "@/features/cart/services/queries";
import {
  AddToCartMutation,
  RemoveFromCartMutation,
  AdjustCartItemMutation,
  ApplyPromotionCodeMutation,
  RemovePromotionCodeMutation,
} from "@/features/cart/services/mutations";
import { updateTag } from "next/cache";
import { setAuthToken } from "@/lib/api/auth-token";
import { getRequestT } from "@/lib/i18n/server";

/**
 * Adds a variant to the active order. `comment` is the customer's answer for the variant's
 * comment-enabled facet values (OrderLine.customFields.comment); lines with different comments
 * stay separate in the order.
 */
export async function addToCart(variantId: string, quantity: number = 1, comment?: string) {
  try {
    const trimmed = comment?.trim();
    const result = await mutate(
      AddToCartMutation,
      { variantId, quantity, customFields: trimmed ? { comment: trimmed } : undefined },
      { useAuthToken: true }
    );

    if (result.token) {
      await setAuthToken(result.token);
    }

    if (result.data.addItemToOrder.__typename === "Order") {
      // Revalidate cart data across all pages
      updateTag("cart");
      updateTag("active-order");
      return { success: true, order: result.data.addItemToOrder };
    } else {
      const error = result.data.addItemToOrder;
      return {
        success: false,
        error:
          error.__typename === "OrderInterceptorError" ? error.interceptorError : error.message,
      };
    }
  } catch {
    return { success: false, error: (await getRequestT()).product.addError };
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

/**
 * Quick order by catalogue code: the product's page (its order matrix) when the code is a product,
 * otherwise the catalogue search for it (partial codes match SKUs there too).
 */
export async function findByCode(code: string): Promise<string> {
  const clean = code
    .trim()
    .split("-")[0]
    .replace(/[^\p{L}\p{N}]/gu, "");
  if (!clean) return "/search";
  try {
    const { data } = await query(
      ProductByCodeQuery,
      { slug: clean.toLowerCase() },
      { useAuthToken: true }
    );
    if (data.product) return `/product/${data.product.slug}`;
  } catch {
    // Fall through to the search.
  }
  return `/search?q=${encodeURIComponent(code.trim())}`;
}
