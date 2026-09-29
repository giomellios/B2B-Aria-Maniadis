import gql from 'graphql-tag';

export const adminApiExtensions = gql`
    type CsvImportResult {
        productsCreated: Int!
        productsUpdated: Int!
        variantsCreated: Int!
        variantsUpdated: Int!
        errors: [String!]!
    }

    type CsvImportJob {
        id: ID!
        state: JobState!
        "0–100"
        progress: Float!
        result: CsvImportResult
        error: String
    }

    extend type Query {
        "Status of an import started with startCsvProductImport."
        csvProductImportJob(id: ID!): CsvImportJob
    }

    extend type Mutation {
        "Uploads an ERP CSV export and imports it on the worker. Poll csvProductImportJob for progress."
        startCsvProductImport(file: Upload!): CsvImportJob!
    }
`;
