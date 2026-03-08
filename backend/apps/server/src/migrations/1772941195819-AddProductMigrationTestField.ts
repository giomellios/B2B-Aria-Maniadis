import {MigrationInterface, QueryRunner} from "typeorm";

export class AddProductMigrationTestField1772941195819 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsMigrationtestfield" character varying(255)`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsMigrationtestfield"`, undefined);
   }

}
