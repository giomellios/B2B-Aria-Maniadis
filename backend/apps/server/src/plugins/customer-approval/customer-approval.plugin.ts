import { LanguageCode, NativeAuthenticationStrategy, PluginCommonModule, VendurePlugin } from '@vendure/core';

import { adminApiExtensions } from './api/api-extensions';
import { CustomerApprovalResolver } from './api/customer-approval.resolver';
import { ApprovalAwareNativeAuthenticationStrategy } from './config/approval-aware-native-authentication-strategy';
import { CustomerApprovalService } from './services/customer-approval.service';
import './types';

/**
 * B2B customer approval: customers can register, but can only log in to the storefront after an
 * administrator has approved them (Customer › "Approve customer" in the Dashboard).
 *
 * - `Customer.customFields.approved` (readonly, not exposed to the Shop API) holds the state; it can
 *   only be changed through the approveCustomer / revokeCustomerApproval Admin API mutations.
 * - The Shop API's native login is replaced with ApprovalAwareNativeAuthenticationStrategy, and a
 *   blocking LoginEvent handler refuses sessions created by any other path (e.g. email verification).
 * - Self-service email verification is intentionally NOT the approval: see vendure-config.ts, where the
 *   verification email handler is removed.
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [CustomerApprovalService],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [CustomerApprovalResolver],
    },
    configuration: config => {
        config.customFields.Customer.push({
            name: 'approved',
            type: 'boolean',
            defaultValue: false,
            nullable: false,
            public: false,
            readonly: true,
            label: [
                { languageCode: LanguageCode.en, value: 'Approved (B2B)' },
                { languageCode: LanguageCode.el, value: 'Εγκεκριμένος πελάτης' },
            ],
            description: [
                {
                    languageCode: LanguageCode.en,
                    value: 'Only approved customers can log in. Use the Approve / Revoke button.',
                },
                {
                    languageCode: LanguageCode.el,
                    value: 'Μόνο εγκεκριμένοι πελάτες μπορούν να συνδεθούν. Χρησιμοποιήστε το κουμπί Έγκριση / Ανάκληση.',
                },
            ],
        });

        const strategies = config.authOptions.shopAuthenticationStrategy;
        const nativeIndex = strategies.findIndex(s => s instanceof NativeAuthenticationStrategy);
        const approvalAware = new ApprovalAwareNativeAuthenticationStrategy();
        if (nativeIndex === -1) {
            strategies.unshift(approvalAware);
        } else {
            strategies[nativeIndex] = approvalAware;
        }
        return config;
    },
    dashboard: './dashboard',
    compatibility: '^3.0.0',
})
export class CustomerApprovalPlugin {}
