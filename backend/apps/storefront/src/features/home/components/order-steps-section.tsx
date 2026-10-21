import { getT } from "@/lib/i18n/server";
import { format } from "@/lib/i18n/dictionaries";
import { OrderSteps } from "@/features/home/components/order-steps";

// Location shots from the 2026 catalogue (printed page numbers), one per step.
const PHOTOS = [
  { src: "/catalogue/scenes/p101.jpg", page: 100 },
  { src: "/catalogue/scenes/p201.jpg", page: 200 },
  { src: "/catalogue/scenes/p185.jpg", page: 184 },
  { src: "/catalogue/scenes/p207.jpg", page: 206 },
  { src: "/catalogue/scenes/p169.jpg", page: 168 },
  { src: "/catalogue/scenes/p211.jpg", page: 210 },
];

export async function OrderStepsSection() {
  const t = await getT();
  const steps = t.home.steps;
  return (
    <OrderSteps
      title={steps.title}
      labels={{ progress: steps.progress }}
      steps={steps.items.map((item, i) => ({
        ...item,
        photo: PHOTOS[i].src,
        alt: format(t.about.photoAlt, { code: format(t.home.hero.page, { from: PHOTOS[i].page }) }),
      }))}
    />
  );
}
