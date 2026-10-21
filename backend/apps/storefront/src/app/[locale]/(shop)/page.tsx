import type { Metadata } from "next";
import { Suspense } from "react";
import {
  HomeHero,
  TownMosaic,
  RangeList,
  OrderStepsSection,
  AboutFacts,
  TradeFaq,
  ApplyStrip,
} from "@/features/home/server";
import { SITE_NAME, buildAlternates, buildCanonicalUrl } from "@/lib/utils";
import { getLocale, getT } from "@/lib/i18n/server";

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
    <main className="pt-header">
      <Suspense>
        <HomeHero />
      </Suspense>
      <TownMosaic />
      <RangeList />
      <OrderStepsSection />
      <AboutFacts />
      <TradeFaq />
      <ApplyStrip />
    </main>
  );
}
