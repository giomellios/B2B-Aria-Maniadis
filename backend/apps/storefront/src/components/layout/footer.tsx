import Image from "next/image";
import { Suspense } from "react";
import { getTopCollections } from "@/lib/queries/cached";
import { getAuthToken } from "@/lib/api/auth-token";
import { Link } from "@/lib/i18n/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
import { format } from "@/lib/i18n/dictionaries";
import { Button } from "@/design-system";
import { DIGITAL_CATALOGUE_URL } from "@/lib/config/links";
import { LanguageSwitcher } from "@/components/layout/navbar/language-switcher";

const COPYRIGHT_YEAR = new Date().getFullYear();
const EMAIL = "maniadibags@gmail.com";
const PHONES = ["319618", "319702", "824111"];

const groupTitle = "text-sm text-muted-foreground";
const navLink = "link-underline text-base";

/** The close of every page: one quiet panel with who we are, where to go and how to reach us. */
export async function Footer() {
  const locale = await getLocale();
  const [collections, t] = await Promise.all([
    getTopCollections(locale, await getAuthToken()),
    getT(),
  ]);

  return (
    <footer className="frame mt-auto pt-24 pb-4 md:pt-32 md:pb-5">
      <div className="rounded-2xl bg-card p-6 md:p-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          <div className="md:col-span-2 lg:col-span-5 lg:pr-12">
            <Link href="/" aria-label={t.nav.homeAria} className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt=""
                width={169}
                height={210}
                className="h-14 w-auto rounded-md bg-white p-1"
              />
              <span className="text-base font-semibold leading-tight">
                ARIA
                <span className="block text-sm font-normal text-muted-foreground">
                  E. Maniadis · 1965
                </span>
              </span>
            </Link>
            <p className="mt-6 max-w-[30ch] text-2xl leading-snug">{t.footer.statement}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button variant="gold" size="lg" asChild>
                <Link href="/register">{t.footer.apply}</Link>
              </Button>
              <Link href="/sign-in" className="link-underline text-base text-muted-foreground">
                {t.footer.signIn}
              </Link>
            </div>
          </div>

          <nav aria-label={t.footer.collections} className="grid grid-cols-2 gap-5 lg:col-span-4">
            <div>
              <h2 className={groupTitle}>{t.footer.shop}</h2>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/search" className={navLink}>
                    {t.footer.allProducts}
                  </Link>
                </li>
                {collections.map((c) => (
                  <li key={c.id}>
                    <Link href={`/collection/${c.slug}`} className={navLink}>
                      {c.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={DIGITAL_CATALOGUE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={navLink}
                  >
                    {t.footer.catalogue} ↗
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className={groupTitle}>{t.footer.company}</h2>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/about" className={navLink}>
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={navLink}>
                    {t.footer.contactPage}
                  </Link>
                </li>
                <li>
                  <Link href="/account/orders" className={navLink}>
                    {t.footer.myOrders}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          <address className="not-italic lg:col-span-3">
            <h2 className={groupTitle}>{t.footer.contact}</h2>
            <p className="mt-3 text-base">
              Ελ. Βενιζέλου 129
              <br />
              Γάζι, Ηράκλειο
            </p>
            <p className="mt-4 text-base tabular-nums">
              {PHONES.map((phone) => (
                <a key={phone} href={`tel:+302810${phone}`} className="link-underline block w-fit">
                  (2810) {phone}
                </a>
              ))}
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className="link-underline mt-4 inline-block break-all text-base"
            >
              {EMAIL}
            </a>
          </address>
        </div>

        <div className="mt-12 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {format(t.footer.copyright, { year: COPYRIGHT_YEAR })}
          </p>
          <Suspense fallback={null}>
            <LanguageSwitcher className="w-fit" />
          </Suspense>
        </div>
      </div>
    </footer>
  );
}
