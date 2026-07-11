import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColegioIdToUsers1783648611501 implements MigrationInterface {
  name = 'AddColegioIdToUsers1783648611501';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "colegio_id" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "colegio_id"`);
  }
}
