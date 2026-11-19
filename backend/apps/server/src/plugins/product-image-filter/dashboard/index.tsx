import { defineDashboardExtension } from "@vendure/dashboard";
import { Check, ImageOff } from "lucide-react";

/**
 * "Εικόνα" column on the product and variant lists (field featuredAssetId, see the plugin).
 * Sort it to bring the products without an image to the top (or the bottom); filter it with
 * "is null" to list only those without an image.
 */
function HasImageCell({ value }: { value: unknown }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-muted-foreground" title="Έχει εικόνα">
      <Check className="h-4 w-4" />
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-destructive">
      <ImageOff className="h-4 w-4" />
      Χωρίς εικόνα
    </span>
  );
}

const IMAGE_COLUMN = "featuredAssetId";

defineDashboardExtension({
  dataTables: [
    {
      pageId: "product-list",
      extendListDocument: `
        query {
          products {
            items {
              featuredAssetId
            }
          }
        }
      `,
      displayComponents: [{ column: IMAGE_COLUMN, component: HasImageCell }],
      viewOptionDefaults: { columnVisibility: { [IMAGE_COLUMN]: true } },
    },
    {
      pageId: "product-variant-list",
      extendListDocument: `
        query {
          productVariants {
            items {
              featuredAssetId
            }
          }
        }
      `,
      displayComponents: [{ column: IMAGE_COLUMN, component: HasImageCell }],
      viewOptionDefaults: { columnVisibility: { [IMAGE_COLUMN]: true } },
    },
  ],
});
