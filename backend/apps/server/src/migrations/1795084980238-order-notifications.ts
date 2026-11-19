import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderNotifications1795084980238 implements MigrationInterface {
  // OrderNotificationsPlugin: Order.customFields.adminSeenAt (internal). Orders placed before this
  // migration count as already seen, so the new-order alert starts empty instead of listing every
  // historical order. IF NOT EXISTS keeps it safe on databases updated by `synchronize` in dev.

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "customFieldsAdminseenat" TIMESTAMP(6)`,
      undefined
    );
    await queryRunner.query(
      `UPDATE "order" SET "customFieldsAdminseenat" = "orderPlacedAt" WHERE "orderPlacedAt" IS NOT NULL AND "customFieldsAdminseenat" IS NULL`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN IF EXISTS "customFieldsAdminseenat"`,
      undefined
    );
  }
}
