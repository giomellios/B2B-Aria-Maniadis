import "server-only";
import { query } from "@/lib/api/client";
import { GetActiveOrderQuery } from "@/features/cart/services/queries";

export async function getActiveOrder() {
  const { data } = await query(
    GetActiveOrderQuery,
    {},
    {
      useAuthToken: true,
    }
  );
  return data.activeOrder;
}

/** Number of items in the active order; 0 when the Vendure API is unreachable. */
export async function getCartItemCount() {
  try {
    const orderResult = await query(GetActiveOrderQuery, undefined, {
      useAuthToken: true,
      tags: ["cart"],
    });
    return orderResult.data.activeOrder?.totalQuantity || 0;
  } catch (error) {
    if (error instanceof TypeError && error.message === "fetch failed") {
      return 0;
    }
    throw error;
  }
}
