import { MigrationInterface, QueryRunner } from "typeorm";

export class FacetComments1795081945394 implements MigrationInterface {
  // FacetCommentsPlugin: FacetValue.customFields.commentEnabled / commentRequired, the translated
  // commentLabel / commentPlaceholder, and OrderLine.customFields.comment. Additive only.
  // IF NOT EXISTS keeps it safe on databases that were created/updated by `synchronize` in dev.

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facet_value_translation" ADD COLUMN IF NOT EXISTS "customFieldsCommentlabel" character varying(255)`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "facet_value_translation" ADD COLUMN IF NOT EXISTS "customFieldsCommentplaceholder" character varying(255)`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "facet_value" ADD COLUMN IF NOT EXISTS "customFieldsCommentenabled" boolean NOT NULL DEFAULT false`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "facet_value" ADD COLUMN IF NOT EXISTS "customFieldsCommentrequired" boolean NOT NULL DEFAULT false`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "order_line" ADD COLUMN IF NOT EXISTS "customFieldsComment" text`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_line" DROP COLUMN IF EXISTS "customFieldsComment"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "facet_value" DROP COLUMN IF EXISTS "customFieldsCommentrequired"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "facet_value" DROP COLUMN IF EXISTS "customFieldsCommentenabled"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "facet_value_translation" DROP COLUMN IF EXISTS "customFieldsCommentplaceholder"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "facet_value_translation" DROP COLUMN IF EXISTS "customFieldsCommentlabel"`,
      undefined
    );
  }
}
