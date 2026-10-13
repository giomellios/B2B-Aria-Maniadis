"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/design-system";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n/provider";

export function SortDropdown() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useT().catalog;
  const sortOptions = [
    { value: "name-asc", label: t.sort.nameAsc },
    { value: "name-desc", label: t.sort.nameDesc },
    { value: "price-asc", label: t.sort.priceAsc },
    { value: "price-desc", label: t.sort.priceDesc },
  ];

  const currentSort = searchParams.get("sort") || "name-asc";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    params.delete("page"); // Reset to page 1 when sort changes
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[190px] border-transparent bg-transparent hover:border-input">
        <SelectValue placeholder={t.sortBy} />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
