"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocaleRouter } from "@/lib/i18n/navigation";
import { stripLocale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/provider";
import { Search, X } from "lucide-react";
import { Input } from "@/design-system";

export function SearchInput() {
  const router = useLocaleRouter();
  const t = useT();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const urlQuery = searchParams.get("q") || "";
  const [searchValue, setSearchValue] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);

  // Reset the field when the URL's query changes (e.g. back/forward navigation).
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setSearchValue(urlQuery);
  }

  const navigateToSearch = (query: string) => {
    startTransition(() => {
      if (!query) {
        router.push("/search");
        return;
      }
      router.push(`/search?q=${encodeURIComponent(query)}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToSearch(searchValue.trim());
  };

  const handleClear = () => {
    setSearchValue("");
    inputRef.current?.focus();
    navigateToSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchValue("");
      inputRef.current?.blur();
      if (stripLocale(pathname) === "/search" && searchParams.has("q")) {
        navigateToSearch("");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        placeholder={t.nav.searchPlaceholder}
        className="h-9 pl-9 pr-8 w-56 bg-secondary/60 border-transparent hover:border-input focus-visible:bg-card focus-visible:w-72 xl:w-64 xl:focus-visible:w-80 transition-[width,background-color,border-color,box-shadow] duration-300 [&::-webkit-search-cancel-button]:hidden"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isPending}
      />
      {searchValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t.nav.searchClear}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  );
}
