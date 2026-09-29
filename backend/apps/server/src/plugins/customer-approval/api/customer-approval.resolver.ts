import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, Customer, ID, Permission, RequestContext, Transaction } from '@vendure/core';

import { CustomerApprovalService } from '../services/customer-approval.service';

@Resolver()
export class CustomerApprovalResolver {
    constructor(private customerApprovalService: CustomerApprovalService) {}

    @Mutation()
    @Transaction()
    @Allow(Permission.UpdateCustomer)
    approveCustomer(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<Customer> {
        return this.customerApprovalService.approve(ctx, args.id);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.UpdateCustomer)
    revokeCustomerApproval(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<Customer> {
        return this.customerApprovalService.revoke(ctx, args.id);
    }

    /** @deprecated kept for older Dashboard builds — use approveCustomer. */
    @Mutation()
    @Transaction()
    @Allow(Permission.UpdateCustomer)
    async manuallyVerifyCustomer(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<boolean> {
        await this.customerApprovalService.approve(ctx, args.id);
        return true;
    }
}
