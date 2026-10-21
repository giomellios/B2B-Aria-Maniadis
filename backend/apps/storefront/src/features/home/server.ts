import "server-only";

// Server-only public API of the home feature: data loaders and
// async server components. Import from server components / pages only.
export {
  HomeHero,
  PHONE,
  PHONE_HREF,
  EMAIL,
  pagesLabel,
} from "@/features/home/components/home-hero";
export { TownMosaic } from "@/features/home/components/town-mosaic";
export { RangeList } from "@/features/home/components/range-list";
export { OrderStepsSection } from "@/features/home/components/order-steps-section";
export { AboutFacts } from "@/features/home/components/about-facts";
export { TradeFaq } from "@/features/home/components/trade-faq";
export { ApplyStrip } from "@/features/home/components/apply-strip";
