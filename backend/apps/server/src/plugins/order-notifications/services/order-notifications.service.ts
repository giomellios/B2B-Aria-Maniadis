import { Injectable } from "@nestjs/common";
import { ID, Order, RequestContext, TransactionalConnection } from "@vendure/core";
import { In, SelectQueryBuilder } from "typeorm";

import "../types";

@Injectable()
export class OrderNotificationsService {
  constructor(private connection: TransactionalConnection) {}

  /** Placed, not cancelled orders of the current channel that no administrator has seen yet. */
  async findUnseen(ctx: RequestContext, take = 5): Promise<{ items: Order[]; totalItems: number }> {
    const [items, totalItems] = await this.unseenQuery(ctx)
      .leftJoinAndSelect("order.customer", "customer")
      .orderBy("order.orderPlacedAt", "DESC")
      .take(Math.min(Math.max(take, 1), 50)) // take(0) would mean "no limit"
      .getManyAndCount();
    return { items, totalItems };
  }

  /** Marks unseen orders as seen (see the markOrdersSeen mutation). Returns how many changed. */
  async markSeen(
    ctx: RequestContext,
    ids?: ID[] | null,
    placedUpTo?: Date | null
  ): Promise<number> {
    const qb = this.unseenQuery(ctx).select("order.id", "id");
    if (ids) {
      if (ids.length === 0) {
        return 0;
      }
      qb.andWhere("order.id IN (:...ids)", { ids });
    }
    if (placedUpTo) {
      qb.andWhere("order.orderPlacedAt <= :placedUpTo", { placedUpTo });
    }
    const rows: Array<{ id: ID }> = await qb.getRawMany();
    if (rows.length === 0) {
      return 0;
    }
    await this.connection
      .getRepository(ctx, Order)
      .update({ id: In(rows.map((row) => row.id)) }, { customFields: { adminSeenAt: new Date() } });
    return rows.length;
  }

  private unseenQuery(ctx: RequestContext): SelectQueryBuilder<Order> {
    return this.connection
      .getRepository(ctx, Order)
      .createQueryBuilder("order")
      .innerJoin("order.channels", "channel", "channel.id = :channelId", {
        channelId: ctx.channelId,
      })
      .where("order.orderPlacedAt IS NOT NULL")
      .andWhere("order.state != :cancelled", { cancelled: "Cancelled" })
      .andWhere("order.customFields.adminSeenAt IS NULL");
  }
}
