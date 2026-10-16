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
        breadcrumbs {
          id
          name
          slug
        }
        children {
          id
          name
          slug
          position
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

/**
 * Everything the filter sidebar offers for the products being browsed (see buildBaseSearchInput):
 * facet values and categories with product counts, plus the cheapest / priciest variant price
 * for the price bands.
 */
export const SearchFilterOptionsQuery = graphql(`
  query SearchFilterOptions(
    $input: SearchInput!
    $cheapestInput: SearchInput!
    $priciestInput: SearchInput!
  ) {
    search(input: $input) {
      totalItems
      facetValues {
        count
        facetValue {
          id
          code
          name
          facet {
            id
            code
            name
          }
        }
      }
      collections {
        count
        collection {
          id
          name
          slug
        }
      }
    }
    cheapest: search(input: $cheapestInput) {
      items {
        currencyCode
        priceWithTax {
          __typename
          ... on SinglePrice {
            value
          }
        }
      }
    }
    priciest: search(input: $priciestInput) {
      items {
        priceWithTax {
          __typename
          ... on SinglePrice {
            value
          }
        }
      }
    }
  }
`);
