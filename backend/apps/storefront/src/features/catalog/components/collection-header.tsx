import { getCollectionSummary } from "@/features/catalog/services/catalog.service";

interface CollectionHeaderProps {
  slug: string;
}

export async function CollectionHeader({ slug }: CollectionHeaderProps) {
  const collection = await getCollectionSummary(slug);
  if (!collection) {
    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Collection not found</h1>
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-2">
      <h1 className="text-3xl font-bold">{collection.name}</h1>
      {collection.description ? (
        <div
          className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: collection.description }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Browse products in this category.</p>
      )}
    </div>
  );
}
