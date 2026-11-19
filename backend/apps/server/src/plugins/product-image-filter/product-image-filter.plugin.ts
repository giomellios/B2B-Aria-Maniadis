import { PluginCommonModule, VendurePlugin } from "@vendure/core";
import gql from "graphql-tag";

/**
 * Lets admins sort and filter the product and variant lists by whether they have an image.
 *
 * Exposes the existing `featuredAssetId` column of Product / ProductVariant in the Admin API. Vendure
 * generates list filter + sort inputs for every scalar field, and its ListQueryBuilder accepts any
 * entity column, so this needs no resolver:
 * - filter `featuredAssetId: { isNull: true }`  → products/variants without an image
 *   (`isNull: false` → with an image)
 * - sort `featuredAssetId: DESC` → without an image first; `ASC` → with an image first
 *   (Postgres puts NULLs first in DESC order, last in ASC order).
 * The Dashboard extension shows the column as "Εικόνα" with a ✓ / "Χωρίς εικόνα" cell.
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  compatibility: "^3.0.0",
  adminApiExtensions: {
    schema: gql`
      extend type Product {
        "ID of the featured image; null when the product has no image. Sort or filter (isNull) on it."
        featuredAssetId: ID
      }
      extend type ProductVariant {
        "ID of the featured image; null when the variant has no image. Sort or filter (isNull) on it."
        featuredAssetId: ID
      }
    `,
  },
  dashboard: "./dashboard/index.tsx",
})
export class ProductImageFilterPlugin {}
