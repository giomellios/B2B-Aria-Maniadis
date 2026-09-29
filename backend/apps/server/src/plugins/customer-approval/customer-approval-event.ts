import { Customer, RequestContext, VendureEvent } from '@vendure/core';

/**
 * Published when an administrator approves or revokes a B2B customer account.
 * Subscribe to it e.g. to send an "your account is approved" email.
 */
export class CustomerApprovalChangedEvent extends VendureEvent {
    constructor(
        public ctx: RequestContext,
        public customer: Customer,
        public approved: boolean,
    ) {
        super();
    }
}
