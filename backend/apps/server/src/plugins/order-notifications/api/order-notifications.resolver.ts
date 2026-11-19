import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Allow, Ctx, ID, Order, Permission, RequestContext, Transaction } from "@vendure/core";

import { OrderNotificationsService } from "../services/order-notifications.service";

@Resolver()
export class OrderNotificationsResolver {
  constructor(private orderNotificationsService: OrderNotificationsService) {}

  @Query()
  @Allow(Permission.ReadOrder)
  unseenOrders(
    @Ctx() ctx: RequestContext,
    @Args() args: { take?: number | null }
  ): Promise<{ items: Order[]; totalItems: number }> {
    return this.orderNotificationsService.findUnseen(ctx, args.take ?? undefined);
  }

  // Only notification state, so anyone who can read orders may mark them as seen.
  @Mutation()
  @Transaction()
  @Allow(Permission.ReadOrder)
  markOrdersSeen(
    @Ctx() ctx: RequestContext,
    @Args() args: { ids?: ID[] | null; placedUpTo?: Date | null }
  ): Promise<number> {
    return this.orderNotificationsService.markSeen(ctx, args.ids, args.placedUpTo);
  }
}
