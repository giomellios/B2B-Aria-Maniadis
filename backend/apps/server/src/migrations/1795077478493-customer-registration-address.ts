import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomerRegistrationAddress1795077478493 implements MigrationInterface {
  // Adds Customer.customFields.address (business address given at registration, prefilled from VIES).
  // IF NOT EXISTS keeps it safe on databases that were created/updated by `synchronize` in dev.

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "customFieldsAddress" character varying(512) NOT NULL DEFAULT ''`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN IF EXISTS "customFieldsAddress"`,
      undefined
    );
  }
}
