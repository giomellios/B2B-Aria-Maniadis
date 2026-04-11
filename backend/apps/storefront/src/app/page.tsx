import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/layout/hero-section";
import { FeaturedProducts } from "@/components/commerce/featured-products";
import { SITE_NAME, SITE_URL, buildCanonicalUrl } from "@/lib/metadata";

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
      <Suspense>
        <FeaturedProducts />
      </Suspense>
    </div>
  );
}
