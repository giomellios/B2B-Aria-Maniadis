import { getCollectionSummary } from "@/features/catalog/services/catalog.service";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Link } from "@/lib/i18n/navigation";
import { getT } from "@/lib/i18n/server";

interface CollectionHeaderProps {
  slug: string;
}

/** Vendure's invisible root collection, first in every breadcrumb. */
const ROOT_COLLECTION = "__root_collection__";

export async function CollectionHeader({ slug }: CollectionHeaderProps) {
  const [collection, t] = await Promise.all([getCollectionSummary(slug), getT()]);
  if (!collection) {
    return (
      <div className="mb-10 border-b border-border pb-10">
        <h1 className="display text-4xl md:text-5xl">{t.catalog.collectionNotFound}</h1>
      </div>
    );
  }

  const ancestors = collection.breadcrumbs.filter(
    (crumb) => crumb.name !== ROOT_COLLECTION && crumb.id !== collection.id
  );
  const children = [...(collection.children ?? [])].sort((a, b) => a.position - b.position);

  return (
    <div className="mb-8 space-y-5 border-b border-border pb-8">
      <Breadcrumb
        label={t.product.breadcrumb}
        items={[
          { label: t.nav.home, href: "/" },
          ...ancestors.map((crumb) => ({ label: crumb.name, href: `/collection/${crumb.slug}` })),
          { label: collection.name },
        ]}
      />
      <h1 className="display text-4xl leading-[1.05] md:text-5xl">{collection.name}</h1>
      {collection.description ? (
        <div
          className="max-w-2xl text-sm leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: collection.description }}
        />
      ) : null}
      {children.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {children.map((child) => (
            <li key={child.id}>
              <Link
                href={`/collection/${child.slug}`}
                className="inline-flex h-9 items-center border border-border px-4 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:border-primary hover:text-primary"
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
