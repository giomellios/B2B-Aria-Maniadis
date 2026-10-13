import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection, ValueProps, HowItWorks } from "@/features/home";
import { CategoryGrid, FeaturedProducts, CtaBanner } from "@/features/home/server";
import { SITE_NAME, buildAlternates, buildCanonicalUrl } from "@/lib/utils";
import { getLocale, getT } from "@/lib/i18n/server";

// TODO: Replace title, description, and OpenGraph copy with final approved text from Maniadis
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getT();
  const title = `${SITE_NAME} — ${t.meta.homeTitle}`;
  return {
    title: { absolute: title },
    description: t.meta.homeDescription,
    alternates: buildAlternates("/", locale),
    openGraph: {
      title,
      description: t.meta.homeDescription,
      type: "website",
      url: buildCanonicalUrl("/", locale),
    },
  };
}

export default async function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <Suspense>
        <CategoryGrid />
      </Suspense>
      <ValueProps />
      <Suspense>
        <FeaturedProducts />
      </Suspense>
      <HowItWorks />
      <Suspense>
        <CtaBanner />
      </Suspense>
    </div>
  );
}
