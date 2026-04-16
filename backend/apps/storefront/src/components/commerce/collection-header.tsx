import { query } from "@/lib/vendure/api";
import { GetCollectionProductsQuery } from "@/lib/vendure/queries";

interface CollectionHeaderProps {
  slug: string;
}

export async function CollectionHeader({ slug }: CollectionHeaderProps) {
  const result = await query(GetCollectionProductsQuery, {
    slug,
    input: { take: 0, collectionSlug: slug, groupByProduct: true },
  });

  const collection = result.data.collection;
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
