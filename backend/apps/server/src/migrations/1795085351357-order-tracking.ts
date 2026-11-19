import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderTracking1795085351357 implements MigrationInterface {
  // CheckoutOptionsPlugin tracking: Order.customFields.trackingNumber (admin-only) and
  // ShippingMethod.customFields.trackingUrl. Where the ΕΛΤΑ / SPEEDEX methods already exist, their
  // tracking pages are filled in (new databases get them from CheckoutOptionsSeedService instead).
  // IF NOT EXISTS keeps it safe on databases updated by `synchronize` in dev.

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shipping_method" ADD COLUMN IF NOT EXISTS "customFieldsTrackingurl" character varying(500)`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "customFieldsTrackingnumber" character varying(100)`,
      undefined
    );
    await queryRunner.query(
      `UPDATE "shipping_method" SET "customFieldsTrackingurl" = 'https://itemsearch.elta.gr/el-GR' WHERE "code" = 'elta' AND "customFieldsTrackingurl" IS NULL`,
      undefined
    );
    await queryRunner.query(
      `UPDATE "shipping_method" SET "customFieldsTrackingurl" = 'https://www.speedex.gr/' WHERE "code" = 'speedex' AND "customFieldsTrackingurl" IS NULL`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN IF EXISTS "customFieldsTrackingnumber"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "shipping_method" DROP COLUMN IF EXISTS "customFieldsTrackingurl"`,
      undefined
    );
  }
}
