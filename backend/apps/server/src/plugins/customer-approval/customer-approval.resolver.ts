import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
    Allow,
    Ctx,
    CustomerService,
    Permission,
    RequestContext,
    TransactionalConnection,
    User,
} from '@vendure/core';

@Resolver()
export class CustomerApprovalResolver {
    constructor(
        private customerService: CustomerService,
        private connection: TransactionalConnection,
    ) {}

    @Mutation()
    @Allow(Permission.UpdateCustomer)
    async manuallyVerifyCustomer(
        @Ctx() ctx: RequestContext,
        @Args('id') id: string,
    ): Promise<boolean> {
        const customer = await this.customerService.findOne(ctx, id, ['user']);
        if (!customer?.user) {
            return false;
        }

        await this.connection
            .getRepository(ctx, User)
            .update(customer.user.id, { verified: true });

        return true;
    }
}
