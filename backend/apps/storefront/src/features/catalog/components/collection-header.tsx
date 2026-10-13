import { getCollectionSummary } from "@/features/catalog/services/catalog.service";
import { getT } from "@/lib/i18n/server";

interface CollectionHeaderProps {
  slug: string;
}

export async function CollectionHeader({ slug }: CollectionHeaderProps) {
  const [collection, t] = await Promise.all([getCollectionSummary(slug), getT()]);
  if (!collection) {
    return (
      <div className="mb-10 border-b border-border pb-10">
        <h1 className="display text-4xl md:text-5xl">{t.catalog.collectionNotFound}</h1>
      </div>
    );
  }

  return (
    <div className="mb-10 space-y-4 border-b border-border pb-10">
      <p className="eyebrow">{t.catalog.collection}</p>
      <h1 className="display text-5xl leading-[1.05] md:text-6xl">{collection.name}</h1>
      {collection.description ? (
        <div
          className="max-w-2xl leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: collection.description }}
        />
      ) : (
        <p className="text-muted-foreground">{t.catalog.collectionFallback}</p>
      )}
    </div>
  );
}
