import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import gql from 'graphql-tag';
import { CustomerApprovalResolver } from './customer-approval.resolver';

@VendurePlugin({
    imports: [PluginCommonModule],
    adminApiExtensions: {
        schema: gql`
            extend type Mutation {
                manuallyVerifyCustomer(id: ID!): Boolean!
            }
        `,
        resolvers: [CustomerApprovalResolver],
    },
    dashboard: './dashboard',
    compatibility: '^3.0.0',
})
export class CustomerApprovalPlugin {}
