import { MigrationInterface, QueryRunner } from "typeorm";

export class CheckoutOptions1795084388204 implements MigrationInterface {
  // CheckoutOptionsPlugin: ShippingMethod.customFields.requiresCarrierDetails and
  // Order.customFields.carrierDetails. Additive only. (The shipping/payment methods themselves are
  // created by CheckoutOptionsSeedService on server start, not here.)
  // IF NOT EXISTS keeps it safe on databases that were created/updated by `synchronize` in dev.

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shipping_method" ADD COLUMN IF NOT EXISTS "customFieldsRequirescarrierdetails" boolean NOT NULL DEFAULT false`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "customFieldsCarrierdetails" text`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN IF EXISTS "customFieldsCarrierdetails"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "shipping_method" DROP COLUMN IF EXISTS "customFieldsRequirescarrierdetails"`,
      undefined
    );
  }
}
