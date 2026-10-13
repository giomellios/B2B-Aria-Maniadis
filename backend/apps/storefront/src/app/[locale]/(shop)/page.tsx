import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection, TrustBar, MarqueeTicker, ValueProps, HowItWorks } from "@/features/home";
import { CategoryGrid, FeaturedProducts, CtaBanner } from "@/features/home/server";
import { SITE_NAME, SITE_URL, buildCanonicalUrl } from "@/lib/utils";

// TODO: Replace title, description, and OpenGraph copy with final approved text from Maniadis
export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — Premium Bags & Hats Wholesale`,
  },
  description:
    "Wholesale bags and hats from Maniadis. Curated collections of premium accessories for retailers across Greece and Europe.",
  alternates: {
    canonical: buildCanonicalUrl("/"),
  },
  openGraph: {
    title: `${SITE_NAME} — Premium Bags & Hats Wholesale`,
    description:
      "Wholesale bags and hats from Maniadis. Quality accessories for discerning retailers.",
    type: "website",
    url: SITE_URL,
  },
};

export default async function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <MarqueeTicker />
      <TrustBar />
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
