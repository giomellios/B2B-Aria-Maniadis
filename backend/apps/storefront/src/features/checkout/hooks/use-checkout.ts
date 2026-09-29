"use client";

import { createContext, useContext } from "react";
import type { CheckoutContextType } from "@/features/checkout/types";

export const CheckoutContext = createContext<CheckoutContextType | null>(null);

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within CheckoutProvider");
  }
  return context;
}
