"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useT } from "@/lib/i18n/provider";

/** Dotted paths to every plain-string entry of the dictionary, e.g. "catalog.inStock". */
type StringPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends Record<string, unknown>
      ? StringPaths<T[K], `${Prefix}${K}.`>
      : never;
}[keyof T & string];

export type MessageKey = StringPaths<Dictionary>;

/**
 * Translated text for components that render on both the server and the client
 * (where neither getT() nor useT() can be called directly).
 */
export function Msg({ k }: { k: MessageKey }) {
  const t = useT();
  const value = k
    .split(".")
    .reduce<unknown>((node, key) => (node as Record<string, unknown>)?.[key], t);
  return <>{typeof value === "string" ? value : k}</>;
}
