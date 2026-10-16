"use client";

import { useState } from "react";
import { isLocaleSwitching } from "@/lib/i18n/locale-switch";

/**
 * Whether a component should play its entrance animation. False when it mounts as part of a
 * language switch (the page is remounted), so it renders in its final state instead of replaying.
 * Use as `initial={entrance ? "hidden" : false}`.
 */
export function useEntranceAnimation(): boolean {
  const [entrance] = useState(() => !isLocaleSwitching());
  return entrance;
}
