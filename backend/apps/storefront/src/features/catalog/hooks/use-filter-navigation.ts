"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

/**
 * Reads and updates the filter query string of the current page (search or collection).
 * Every change goes back to page 1 (dropping "load more") and keeps the scroll position.
 */
export function useFilterNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const update = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams);
    mutate(params);
    params.delete("page");
    params.delete("more");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  /** Adds `value` to the repeatable `key` if absent, removes it if present. */
  const toggle = (key: string, value: string) =>
    update((params) => {
      const current = params.getAll(key);
      params.delete(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      next.forEach((v) => params.append(key, v));
    });

  const set = (key: string, value: string | null) =>
    update((params) => {
      if (value == null) params.delete(key);
      else params.set(key, value);
    });

  const clearFilters = () =>
    update((params) => {
      for (const key of ["facets", "category", "price", "inStock"]) params.delete(key);
    });

  return { searchParams, isPending, toggle, set, clearFilters };
}
