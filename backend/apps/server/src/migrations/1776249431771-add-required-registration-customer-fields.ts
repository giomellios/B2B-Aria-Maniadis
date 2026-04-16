import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRequiredRegistrationCustomerFields1776249431771 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "customer" ADD "customFieldsVatnumber" character varying(255) NOT NULL DEFAULT ''`, undefined);
        await queryRunner.query(`ALTER TABLE "customer" ADD "customFieldsCompany" character varying(255) NOT NULL DEFAULT ''`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "customFieldsCompany"`, undefined);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "customFieldsVatnumber"`, undefined);
   }

}
