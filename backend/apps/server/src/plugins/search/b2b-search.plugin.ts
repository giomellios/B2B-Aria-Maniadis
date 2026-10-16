import { PluginCommonModule, VendurePlugin } from "@vendure/core";
import gql from "graphql-tag";

/**
 * Shop API additions to `search` used by the storefront filters. The filtering itself happens in
 * B2BPostgresSearchStrategy (registered on DefaultSearchPlugin in vendure-config.ts), which reads
 * the extra input fields — so this plugin only extends the schema.
 */
const shopApiExtensions = gql`
  """
  Price bounds in minor units (cents), tax included. Either bound may be omitted.
  """
  input SearchPriceRangeInput {
    min: Int
    max: Int
  }

  extend input SearchInput {
    """
    Only return variants whose price with tax lies within the range (inclusive).
    """
    priceRangeWithTax: SearchPriceRangeInput
  }
`;

@VendurePlugin({
  imports: [PluginCommonModule],
  shopApiExtensions: { schema: shopApiExtensions },
  compatibility: "^3.0.0",
})
export class B2BSearchPlugin {}
