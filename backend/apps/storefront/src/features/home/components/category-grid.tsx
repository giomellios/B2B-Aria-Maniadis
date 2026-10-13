import { getTopCollections } from "@/lib/queries/cached";
import { CategoryGridClient } from "@/features/home/components/category-grid-client";
import { RevealHeading } from "@/design-system";
import { getLocale, getT } from "@/lib/i18n/server";

export async function CategoryGrid() {
  const [collections, t] = await Promise.all([getTopCollections(await getLocale()), getT()]);

  if (collections.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-12 max-w-xl space-y-3">
          <p className="eyebrow">{t.home.categories.eyebrow}</p>
          <RevealHeading className="display text-4xl md:text-5xl">
            {t.home.categories.title}
          </RevealHeading>
        </div>
        <CategoryGridClient collections={collections} />
      </div>
    </section>
  );
}
