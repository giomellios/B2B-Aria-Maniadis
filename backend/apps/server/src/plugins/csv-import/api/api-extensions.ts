import gql from 'graphql-tag';

export const adminApiExtensions = gql`
    type CsvImportResult {
        productsCreated: Int!
        productsUpdated: Int!
        variantsCreated: Int!
        errors: [String!]!
    }

    extend type Mutation {
        importProductsFromCsv(
            csvBase64: String!
        ): CsvImportResult!
    }
`;
