import gql from 'graphql-tag';

export const adminApiExtensions = gql`
    enum AssetVariantMappingStatus {
        MAPPED
        UNMATCHED
        FAILED
    }

    type AssetVariantMappingItem {
        assetId: ID!
        assetName: String!
        filenameToken: String!
        status: AssetVariantMappingStatus!
        variantId: ID
        variantSku: String
        reason: String
    }

    type AssetVariantMappingResult {
        totalAssets: Int!
        mappedAssets: Int!
        unmatchedAssets: Int!
        failedAssets: Int!
        updatedVariants: Int!
        messages: [String!]!
        items: [AssetVariantMappingItem!]!
    }

    extend type Mutation {
        mapAssetsToVariantsByFilename(assetIds: [ID!]!): AssetVariantMappingResult!
    }
`;
