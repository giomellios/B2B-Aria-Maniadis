import {MigrationInterface, QueryRunner} from "typeorm";

export class CustomerApprovalFlag1790609034611 implements MigrationInterface {
    // Adds Customer.customFields.approved (CustomerApprovalPlugin) and marks already-verified customers as approved.

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "customer" ADD "customFieldsApproved" boolean NOT NULL DEFAULT false`, undefined);
        // Until now "approved" meant "verified" (admins used the Verify button and no verification
        // emails were sent), so every customer who can already log in stays approved.
        await queryRunner.query(
            `UPDATE "customer" SET "customFieldsApproved" = true
             WHERE "userId" IN (SELECT "id" FROM "user" WHERE "verified" = true)`,
            undefined,
        );
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "customFieldsApproved"`, undefined);
   }

}
