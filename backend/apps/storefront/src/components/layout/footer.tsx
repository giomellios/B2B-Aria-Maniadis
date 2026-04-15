import { cacheLife } from "next/cache";
import { getTopCollections } from "@/lib/vendure/cached";
import Link from "next/link";
import { Instagram, Facebook, Linkedin } from "lucide-react";

// TODO: Replace # with real Maniadis social profile URLs
const SOCIAL_LINKS = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
];

async function Copyright() {
  "use cache";
  cacheLife("days");

  return (
    <p className="text-sm text-muted-foreground">
      © {new Date().getFullYear()} Maniadis. All rights reserved.
    </p>
  );
}

export async function Footer() {
  "use cache";
  cacheLife("days");

  const collections = await getTopCollections();

  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-widest uppercase">Maniadis</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium wholesale bags and hats for retailers across Greece and Europe.
            </p>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-widest uppercase">Collections</p>
            <ul className="space-y-2">
              {collections.length > 0 ? (
                collections.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/collection/${c.slug}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      All Products
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-widest uppercase">Account</p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/sign-in"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-widest uppercase">Contact</p>
            {/* TODO: Replace with real contact email, phone, and address from Maniadis */}
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contact@maniadis.gr</li>
              <li>Greece</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <Copyright />
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
