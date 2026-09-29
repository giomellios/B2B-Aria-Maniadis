import { graphql } from "@/lib/api/graphql";

export const ProductCardFragment = graphql(`
  fragment ProductCard on SearchResult {
    productId
    productName
    productVariantName
    sku
    inStock
    slug
    productAsset {
      id
      preview
    }
    productVariantAsset {
      id
      preview
    }
    priceWithTax {
      __typename
      ... on PriceRange {
        min
        max
      }
      ... on SinglePrice {
        value
      }
    }
    currencyCode
  }
`);
