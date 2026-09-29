import { Customer, ID, Injector, NativeAuthenticationStrategy, RequestContext, TransactionalConnection, User } from '@vendure/core';
import type { NativeAuthenticationData } from '@vendure/core/dist/config/auth/native-authentication-strategy';

import { ACCOUNT_PENDING_APPROVAL } from '../constants';
import '../types';

/**
 * Returns true when the user belongs to a Customer who has NOT been approved by an admin.
 * Users without a Customer (e.g. administrators) are never "pending".
 */
export async function isCustomerApprovalPending(
    connection: TransactionalConnection,
    ctx: RequestContext,
    userId: ID,
): Promise<boolean> {
    const customer = await connection.getRepository(ctx, Customer).findOne({
        where: { user: { id: userId } },
    });
    return !!customer && customer.customFields?.approved !== true;
}

/**
 * Drop-in replacement for the Shop API's NativeAuthenticationStrategy (same name, "native",
 * so the `login` mutation keeps working) that refuses customers who have not been approved yet.
 * Pending customers get NotVerifiedError (approval and verification go together), or — if they
 * somehow became verified without approval — InvalidCredentialsError with
 * `authenticationError: "ACCOUNT_PENDING_APPROVAL"`.
 */
export class ApprovalAwareNativeAuthenticationStrategy extends NativeAuthenticationStrategy {
    private approvalConnection: TransactionalConnection;

    async init(injector: Injector) {
        await super.init(injector);
        this.approvalConnection = injector.get(TransactionalConnection);
    }

    async authenticate(ctx: RequestContext, data: NativeAuthenticationData): Promise<User | false> {
        const user = await super.authenticate(ctx, data);
        if (!user) {
            return false;
        }
        if (!(await isCustomerApprovalPending(this.approvalConnection, ctx, user.id))) {
            return user;
        }
        if (!user.verified) {
            // Normal "waiting for approval" case: approval is what marks a user verified, so let
            // Vendure answer with NotVerifiedError — the storefront shows its "wait for admin
            // verification" message for that. (If requireVerification were ever turned off, the
            // blocking LoginEvent guard in CustomerApprovalService still refuses the session.)
            return user;
        }
        // Verified but not approved, e.g. the customer completed a password reset (which Vendure
        // treats as email verification). AuthenticationStrategy.authenticate() may return a string
        // (the error message); the NativeAuthenticationStrategy base class declares a narrower type.
        return ACCOUNT_PENDING_APPROVAL as unknown as false;
    }
}
