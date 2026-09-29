import { graphql } from "@/lib/api/graphql";
import { ProductCardFragment } from "@/features/catalog/services/fragments";

export const SearchProductsQuery = graphql(
  `
    query SearchProducts($input: SearchInput!) {
      search(input: $input) {
        totalItems
        items {
          ...ProductCard
        }
        facetValues {
          count
          facetValue {
            id
            name
            facet {
              id
              name
            }
          }
        }
      }
    }
  `,
  [ProductCardFragment]
);

export const GetProductCardImageFallbackQuery = graphql(`
  query GetProductCardImageFallback($slug: String!) {
    product(slug: $slug) {
      id
      slug
      featuredAsset {
        id
        preview
      }
      assets {
        id
        preview
      }
      variants {
        id
        featuredAsset {
          id
          preview
        }
      }
    }
  }
`);

export const GetProductDetailQuery = graphql(`
  query GetProductDetail($slug: String!) {
    product(slug: $slug) {
      id
      name
      description
      slug
      featuredAsset {
        id
        preview
        source
      }
      assets {
        id
        preview
        source
      }
      variants {
        id
        name
        sku
        featuredAsset {
          id
          preview
          source
        }
        priceWithTax
        stockLevel
        options {
          id
          code
          name
          groupId
          group {
            id
            code
            name
          }
        }
      }
      optionGroups {
        id
        code
        name
        options {
          id
          code
          name
        }
      }
      collections {
        id
        name
        slug
        parent {
          id
        }
      }
    }
  }
`);

export const GetCollectionProductsQuery = graphql(
  `
    query GetCollectionProducts($slug: String!, $input: SearchInput!) {
      collection(slug: $slug) {
        id
        name
        slug
        description
        featuredAsset {
          id
          preview
        }
      }
      search(input: $input) {
        totalItems
        items {
          ...ProductCard
        }
      }
    }
  `,
  [ProductCardFragment]
);
