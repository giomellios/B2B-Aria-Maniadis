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
