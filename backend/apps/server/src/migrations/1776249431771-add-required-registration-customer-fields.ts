import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRequiredRegistrationCustomerFields1776249431771 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "customFieldsVatnumber" character varying(255) NOT NULL DEFAULT ''`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "customFieldsCompany" character varying(255) NOT NULL DEFAULT ''`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN IF EXISTS "customFieldsCompany"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN IF EXISTS "customFieldsVatnumber"`,
      undefined
    );
  }
}
