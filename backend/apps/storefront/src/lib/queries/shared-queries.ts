import { graphql } from "@/lib/api/graphql";

export const GetTopCollectionsQuery = graphql(`
  query GetTopCollections {
    collections(options: { filter: { parentId: { eq: "1" } } }) {
      items {
        id
        name
        slug
      }
    }
  }
`);

export const GetAvailableCountriesQuery = graphql(`
  query GetAvailableCountries {
    availableCountries {
      id
      code
      name
    }
  }
`);

export const GetActiveChannelQuery = graphql(`
  query GetActiveChannel {
    activeChannel {
      id
      code
      defaultLanguageCode
      availableLanguageCodes
      defaultCurrencyCode
      availableCurrencyCodes
    }
  }
`);

/**
 * Category menu: top-level collections with two levels of children (private ones are not returned
 * by the Shop API).
 */
export const GetCategoryTreeQuery = graphql(`
  query GetCategoryTree {
    collections(options: { topLevelOnly: true, take: 100, sort: { position: ASC } }) {
      items {
        id
        name
        slug
        position
        children {
          id
          name
          slug
          position
          children {
            id
            name
            slug
            position
          }
        }
      }
    }
  }
`);
