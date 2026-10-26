import Image from "next/image";
import { Suspense } from "react";
import { Link } from "@/lib/i18n/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/layout/navbar/language-switcher";
import { CategoryLink } from "@/components/layout/navbar/category-link";
import { MobileMenu } from "@/components/layout/navbar/mobile-menu";
import { NavbarCart } from "@/features/cart/server";
import { NavbarUser } from "@/features/auth/server";
import { SearchDialog } from "@/components/layout/search-dialog";
import { NavbarUserSkeleton } from "@/features/auth";
import { getCategoryTree } from "@/lib/queries/cached";
import { getAuthToken } from "@/lib/api/auth-token";

const linkClass =
  "inline-flex h-10 items-center rounded-md px-3 text-base text-muted-foreground transition-colors duration-200 hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:decoration-gold aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8";

/**
 * One calm bar: the crest and name on the left, the shop's few destinations in the middle, and on
 * the right only what a buyer reaches for (search, language, cart, account).
 */
export async function Navbar() {
  const t = await getT();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-header bg-background">
      <div className="mx-auto grid h-full max-w-[100rem] grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-5 lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="group flex w-fit items-center gap-3" aria-label={t.nav.homeAria}>
          <Image
            src="/logo.png"
            alt=""
            width={169}
            height={210}
            priority
            className="h-11 w-auto rounded-md bg-white p-1 transition-transform duration-500 ease-out group-hover:-rotate-3"
          />
          <span className="hidden text-base font-semibold leading-none tracking-[-0.01em] sm:block">
            ARIA
            <span className="ml-2 text-sm font-normal tracking-normal text-muted-foreground">
              E. Maniadis
            </span>
          </span>
        </Link>

        <Suspense fallback={<div className="hidden lg:block" />}>
          <PrimaryLinks />
        </Suspense>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <div className="hidden xl:block">
            <Suspense fallback={<div className="h-10 w-64 rounded-md bg-field" />}>
              <SearchDialog trigger="field" />
            </Suspense>
          </div>
          <div className="xl:hidden">
            <Suspense fallback={<div className="size-10" />}>
              <SearchDialog />
            </Suspense>
          </div>
          <Suspense fallback={<div className="hidden h-9 w-[72px] sm:block" />}>
            <LanguageSwitcher className="hidden sm:flex" />
          </Suspense>
          <Suspense>
            <NavbarCart />
          </Suspense>
          <Suspense fallback={<NavbarUserSkeleton />}>
            <NavbarUser />
          </Suspense>
          <Suspense fallback={<div className="size-10 lg:hidden" />}>
            <MobileLinks />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function PrimaryLinks() {
  const [categories, t] = await Promise.all([
    getCategoryTree(await getLocale(), await getAuthToken()),
    getT(),
  ]);
  return (
    <nav aria-label={t.nav.categories} className="hidden lg:block">
      <ul className="flex items-center gap-1">
        <li>
          <CategoryLink href="/search" className={linkClass}>
            {t.nav.catalogue}
          </CategoryLink>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryLink href={`/collection/${category.slug}`} className={linkClass}>
              {category.name}
            </CategoryLink>
          </li>
        ))}
        <li>
          <CategoryLink href="/about" className={linkClass}>
            {t.nav.about}
          </CategoryLink>
        </li>
        <li>
          <CategoryLink href="/contact" className={linkClass}>
            {t.nav.contact}
          </CategoryLink>
        </li>
      </ul>
    </nav>
  );
}

async function MobileLinks() {
  const [categories, t] = await Promise.all([
    getCategoryTree(await getLocale(), await getAuthToken()),
    getT(),
  ]);
  return (
    <MobileMenu
      label={t.nav.menu}
      links={[
        { href: "/search", label: t.nav.catalogue },
        ...categories.map((c) => ({ href: `/collection/${c.slug}`, label: c.name })),
        { href: "/about", label: t.nav.about },
        { href: "/contact", label: t.nav.contact },
      ]}
    />
  );
}
