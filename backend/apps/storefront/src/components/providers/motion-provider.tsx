"use client";

import { MotionConfig } from "framer-motion";

/** Framer Motion animations follow the OS "reduce motion" setting. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
