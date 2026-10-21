import { graphql } from "@/lib/api/graphql";

/** How many products each destination (island) facet value has, for the island sheet. */
export const DestinationCountsQuery = graphql(`
  query DestinationCounts {
    search(input: { take: 0, groupByProduct: true }) {
      facetValues {
        count
        facetValue {
          id
          code
          facet {
            id
            code
          }
        }
      }
    }
  }
`);
