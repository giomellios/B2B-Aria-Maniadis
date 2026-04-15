import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/layout/hero-section";
import { TrustBar } from "@/components/layout/trust-bar";
import { MarqueeTicker } from "@/components/layout/marquee-ticker";
import { CategoryGrid } from "@/components/layout/category-grid";
import { ValueProps } from "@/components/layout/value-props";
import { FeaturedProducts } from "@/components/commerce/featured-products";
import { HowItWorks } from "@/components/layout/how-it-works";
import { CtaBanner } from "@/components/layout/cta-banner";
import { SITE_NAME, SITE_URL, buildCanonicalUrl } from "@/lib/metadata";

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

export default async function Home(_props: PageProps<"/">) {
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
      <CtaBanner />
    </div>
  );
}
