"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocaleRouter } from "@/lib/i18n/navigation";
import { useT } from "@/lib/i18n/provider";
import { Search, X } from "@/design-system/icons";
import { Dialog, DialogContent, DialogTitle, DialogClose, Input, Button } from "@/design-system";

/** `field`: a search-box-shaped button with its label (desktop header); `icon`: just the icon. */
export function SearchDialog({ trigger = "icon" }: { trigger?: "icon" | "field" }) {
  const [open, setOpen] = useState(false);
  const router = useLocaleRouter();
  const t = useT();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      // Start from the current search term each time the dialog opens.
      setSearchValue(searchParams.get("q") || "");
    }
    setOpen(nextOpen);
  };

  const navigateToSearch = (query: string) => {
    startTransition(() => {
      router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
    });
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToSearch(searchValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <>
      {trigger === "field" ? (
        <button
          type="button"
          onClick={() => handleOpenChange(true)}
          className="flex h-10 w-64 items-center gap-2.5 rounded-md bg-field px-3 text-left text-base text-muted-foreground transition-colors hover:bg-field-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate">{t.nav.searchPlaceholder}</span>
        </button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.nav.searchOpen}
          onClick={() => handleOpenChange(true)}
        >
          <Search className="size-5" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="top-[72px] translate-y-0 sm:max-w-xl p-3" showCloseButton={false}>
          <DialogTitle className="sr-only">{t.nav.searchTitle}</DialogTitle>
          <div className="flex items-center gap-2">
            <form onSubmit={handleSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                ref={inputRef}
                type="search"
                placeholder={t.nav.searchPlaceholderLong}
                className="pl-9 w-full appearance-none [&::-webkit-search-cancel-button]:hidden"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
              />
            </form>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label={t.nav.searchClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
