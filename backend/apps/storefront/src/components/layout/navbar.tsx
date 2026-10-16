import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getT } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/layout/navbar/language-switcher";
import { CategoryBar } from "@/components/layout/navbar/category-bar";
import { NavbarCart } from "@/features/cart/server";
import { NavbarUser } from "@/features/auth/server";
import { ThemeSwitcher } from "@/components/layout/navbar/theme-switcher";
import { Suspense } from "react";
import { SearchInput } from "@/components/layout/search-input";
import { SearchDialog } from "@/components/layout/search-dialog";
import { NavbarUserSkeleton } from "@/features/auth";
import { SearchInputSkeleton } from "@/components/layout/search-input-skeleton";

export async function Navbar() {
  const t = await getT();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-header border-b border-border bg-background/92 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-10">
            <Link href="/" className="group flex items-center gap-3" aria-label={t.nav.homeAria}>
              <Image
                src="/logo.png"
                alt=""
                width={169}
                height={210}
                priority
                className="h-11 w-auto transition-transform duration-500 ease-out group-hover:-rotate-3 dark:brightness-0 dark:invert"
              />
              <span className="hidden leading-none sm:block">
                <span className="block font-serif text-xl tracking-[0.12em] text-primary">
                  ARIA
                </span>
                <span className="mt-1 block text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                  E. Maniadis
                </span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden lg:flex">
              <Suspense fallback={<SearchInputSkeleton />}>
                <SearchInput />
              </Suspense>
            </div>
            <div className="flex lg:hidden">
              <Suspense fallback={<div className="h-9 w-9" />}>
                <SearchDialog />
              </Suspense>
            </div>
            <Suspense fallback={<div className="h-8 w-[76px] rounded-full border border-border" />}>
              <LanguageSwitcher />
            </Suspense>
            <ThemeSwitcher />
            <Suspense>
              <NavbarCart />
            </Suspense>
            <Suspense fallback={<NavbarUserSkeleton />}>
              <NavbarUser />
            </Suspense>
          </div>
        </div>
      </div>
      <Suspense fallback={<div className="h-11 border-t border-border" />}>
        <CategoryBar />
      </Suspense>
    </header>
  );
}
