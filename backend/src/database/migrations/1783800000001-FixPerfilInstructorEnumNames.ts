import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * La migración anterior (MoveInstructorProfileToPerfilInstructor) reutiliza a
 * propósito los enums `users_dependencia_enum` / `users_estadodisponibilidad_enum`
 * ya existentes para no duplicarlos. TypeORM, sin embargo, espera que las
 * columnas de `perfil_instructor` usen enums con su propio nombre por
 * convención (`perfil_instructor_<columna>_enum`). Esta migración solo
 * renombra/recrea esos tipos para que coincidan con lo que el entity declara
 * — no cambia ningún dato.
 */
export class FixPerfilInstructorEnumNames1783800000001 implements MigrationInterface {
  name = 'FixPerfilInstructorEnumNames1783800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "perfil_instructor" DROP CONSTRAINT "FK_perfil_instructor_user"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_dependencia_enum" RENAME TO "users_dependencia_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."perfil_instructor_dependencia_enum" AS ENUM('Articulacion', 'Titulada', 'Complementaria')`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfil_instructor" ALTER COLUMN "dependencia" TYPE "public"."perfil_instructor_dependencia_enum" USING "dependencia"::"text"::"public"."perfil_instructor_dependencia_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_dependencia_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_estadodisponibilidad_enum" RENAME TO "users_estadodisponibilidad_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."perfil_instructor_estadodisponibilidad_enum" AS ENUM('Disponible', 'Parcial', 'Saturado')`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfil_instructor" ALTER COLUMN "estadoDisponibilidad" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfil_instructor" ALTER COLUMN "estadoDisponibilidad" TYPE "public"."perfil_instructor_estadodisponibilidad_enum" USING "estadoDisponibilidad"::"text"::"public"."perfil_instructor_estadodisponibilidad_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfil_instructor" ALTER COLUMN "estadoDisponibilidad" SET DEFAULT 'Disponible'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_estadodisponibilidad_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "perfil_instructor" ADD CONSTRAINT "FK_45d8232515d37ac7dd5c49877e3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "perfil_instructor" DROP CONSTRAINT "FK_45d8232515d37ac7dd5c49877e3"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_estadodisponibilidad_enum_old" AS ENUM('Disponible', 'Parcial', 'Saturado')`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfil_instructor" ALTER COLUMN "estadoDisponibilidad" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfil_instructor" ALTER COLUMN "estadoDisponibilidad" TYPE "public"."users_estadodisponibilidad_enum_old" USING "estadoDisponibilidad"::"text"::"public"."users_estadodisponibilidad_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfil_instructor" ALTER COLUMN "estadoDisponibilidad" SET DEFAULT 'Disponible'`,
    );
    await queryRunner.query(`DROP TYPE "public"."perfil_instructor_estadodisponibilidad_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_estadodisponibilidad_enum_old" RENAME TO "users_estadodisponibilidad_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_dependencia_enum_old" AS ENUM('Articulacion', 'Titulada', 'Complementaria')`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfil_instructor" ALTER COLUMN "dependencia" TYPE "public"."users_dependencia_enum_old" USING "dependencia"::"text"::"public"."users_dependencia_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."perfil_instructor_dependencia_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_dependencia_enum_old" RENAME TO "users_dependencia_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfil_instructor" ADD CONSTRAINT "FK_perfil_instructor_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
