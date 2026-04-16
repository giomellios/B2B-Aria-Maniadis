"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (open) {
      setSearchValue(searchParams.get("q") || "");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, searchParams]);

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
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open search"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[72px] translate-y-0 sm:max-w-xl p-3" showCloseButton={false}>
          <DialogTitle className="sr-only">Search products</DialogTitle>
          <div className="flex items-center gap-2">
            <form onSubmit={handleSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search by product name, SKU, or keyword..."
                className="pl-9 w-full [&::-webkit-search-cancel-button]:hidden"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
              />
            </form>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close search">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
