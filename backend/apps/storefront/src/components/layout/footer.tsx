import { Suspense } from "react";
import { getTopCollections } from "@/lib/queries/cached";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
import { format } from "@/lib/i18n/dictionaries";
import { LanguageSwitcher } from "@/components/layout/navbar/language-switcher";
import { Instagram, Facebook, Linkedin } from "@/design-system/icons";

// TODO: Replace # with real Maniadis social profile URLs
const SOCIAL_LINKS = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
];

const COPYRIGHT_YEAR = new Date().getFullYear();

async function Copyright() {
  const t = await getT();
  return (
    <p className="text-xs text-muted-foreground">
      {format(t.footer.copyright, { year: COPYRIGHT_YEAR })}
    </p>
  );
}

export async function Footer() {
  const [collections, t] = await Promise.all([getTopCollections(await getLocale()), getT()]);

  return (
    <footer className="mt-auto border-t border-border bg-secondary">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 space-y-5 md:col-span-1">
            <Image
              src="/logo.png"
              alt={t.home.hero.crestAlt}
              width={169}
              height={210}
              className="h-20 w-auto dark:brightness-0 dark:invert"
            />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t.footer.tagline}
            </p>
          </div>

          {/* Collections */}
          <div className="space-y-4">
            <p className="eyebrow">{t.footer.collections}</p>
            <ul className="space-y-2.5">
              {collections.length > 0 ? (
                collections.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/collection/${c.slug}`}
                      className="link-underline text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link
                      href="/search"
                      className="link-underline text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {t.footer.allProducts}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <p className="eyebrow">{t.footer.account}</p>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/account/orders"
                  className="link-underline text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t.footer.myOrders}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <p className="eyebrow">{t.footer.contact}</p>
            {/* TODO: Replace with real contact email, phone, and address from Maniadis */}
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contact@maniadis.gr</li>
              <li>{t.footer.country}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Copyright />
            <Suspense fallback={null}>
              <LanguageSwitcher />
            </Suspense>
          </div>
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-[color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
