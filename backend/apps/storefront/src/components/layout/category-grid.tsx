import { getTopCollections } from "@/lib/vendure/cached";
import { CategoryGridClient } from "./category-grid-client";
import { RevealHeading } from "@/components/ui/reveal-heading";

export async function CategoryGrid() {
  const collections = await getTopCollections();

  if (collections.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 space-y-2">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
            What We Offer
          </p>
          <RevealHeading className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
            Browse by Category
          </RevealHeading>
        </div>
        <CategoryGridClient collections={collections} />
      </div>
    </section>
  );
}
