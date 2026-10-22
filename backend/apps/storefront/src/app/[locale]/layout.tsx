import type { Metadata, Viewport } from "next";
import { Geologica } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LOCALES, OG_LOCALE, isLocale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { LocaleProvider } from "@/lib/i18n/provider";
import { Toaster } from "@/design-system";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { RevealObserver } from "@/components/shared/reveal-observer";
import { SITE_NAME, SITE_URL } from "@/lib/utils";

// One family for display and text; it includes Greek glyphs.
const bodyFont = Geologica({
  variable: "--font-body",
  subsets: ["latin", "greek"],
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = dictionaries[locale];
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: t.meta.siteDescription,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: {
      card: "summary_large_image",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f1ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a08" },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${bodyFont.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <LocaleProvider locale={locale}>
          <ThemeProvider>
            <Navbar />
            {children}
            {/* The footer reads the request's locale and the collections. */}
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
            <Toaster />
            <Suspense fallback={null}>
              <RevealObserver />
            </Suspense>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
