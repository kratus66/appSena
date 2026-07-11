import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Mueve los campos de perfil de instructor desde `users` a una tabla 1:1
 * `perfil_instructor`. Reutiliza los tipos enum existentes
 * (`users_dependencia_enum`, `users_estadodisponibilidad_enum`) para no
 * duplicarlos.
 */
export class MoveInstructorProfileToPerfilInstructor1783800000000 implements MigrationInterface {
  name = 'MoveInstructorProfileToPerfilInstructor1783800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear la tabla de perfil (reutiliza los enums ya existentes de users)
    await queryRunner.query(`
      CREATE TABLE "perfil_instructor" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "created_by_id" uuid,
        "updated_by_id" uuid,
        "deleted_by_id" uuid,
        "user_id" uuid NOT NULL,
        "profesion" character varying(150),
        "dependencia" "public"."users_dependencia_enum",
        "area" character varying(150),
        "tipoPrograma" character varying(150),
        "sede" character varying(150),
        "fechaInicioContrato" date,
        "fechaFinContrato" date,
        "colegioArticulacion" character varying(200),
        "modalidadArticulacion" character varying(100),
        "jornadaArticulacion" character varying(50),
        "localidad" character varying(150),
        "estadoDisponibilidad" "public"."users_estadodisponibilidad_enum" DEFAULT 'Disponible',
        CONSTRAINT "PK_perfil_instructor" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_perfil_instructor_user" UNIQUE ("user_id"),
        CONSTRAINT "FK_perfil_instructor_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // 2. Migrar los datos de los instructores existentes
    await queryRunner.query(`
      INSERT INTO "perfil_instructor" (
        "user_id", "profesion", "dependencia", "area", "tipoPrograma", "sede",
        "fechaInicioContrato", "fechaFinContrato", "colegioArticulacion",
        "modalidadArticulacion", "jornadaArticulacion", "localidad", "estadoDisponibilidad"
      )
      SELECT
        "id", "profesion", "dependencia", "area", "tipoPrograma", "sede",
        "fechaInicioContrato", "fechaFinContrato", "colegioArticulacion",
        "modalidadArticulacion", "jornadaArticulacion", "localidad", "estadoDisponibilidad"
      FROM "users"
      WHERE "rol" = 'instructor'
    `);

    // 3. Eliminar las columnas de perfil de la tabla users
    const columnas = [
      'profesion',
      'dependencia',
      'area',
      'tipoPrograma',
      'sede',
      'fechaInicioContrato',
      'fechaFinContrato',
      'colegioArticulacion',
      'modalidadArticulacion',
      'jornadaArticulacion',
      'localidad',
      'estadoDisponibilidad',
    ];
    for (const col of columnas) {
      await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "${col}"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Restaurar las columnas en users (reutiliza los enums existentes)
    await queryRunner.query(`ALTER TABLE "users" ADD "profesion" character varying(150)`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "dependencia" "public"."users_dependencia_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "area" character varying(150)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "tipoPrograma" character varying(150)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "sede" character varying(150)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "fechaInicioContrato" date`);
    await queryRunner.query(`ALTER TABLE "users" ADD "fechaFinContrato" date`);
    await queryRunner.query(`ALTER TABLE "users" ADD "colegioArticulacion" character varying(200)`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "modalidadArticulacion" character varying(100)`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "jornadaArticulacion" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "localidad" character varying(150)`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "estadoDisponibilidad" "public"."users_estadodisponibilidad_enum" DEFAULT 'Disponible'`,
    );

    // 2. Copiar los datos de vuelta a users
    await queryRunner.query(`
      UPDATE "users" u SET
        "profesion" = p."profesion",
        "dependencia" = p."dependencia",
        "area" = p."area",
        "tipoPrograma" = p."tipoPrograma",
        "sede" = p."sede",
        "fechaInicioContrato" = p."fechaInicioContrato",
        "fechaFinContrato" = p."fechaFinContrato",
        "colegioArticulacion" = p."colegioArticulacion",
        "modalidadArticulacion" = p."modalidadArticulacion",
        "jornadaArticulacion" = p."jornadaArticulacion",
        "localidad" = p."localidad",
        "estadoDisponibilidad" = p."estadoDisponibilidad"
      FROM "perfil_instructor" p
      WHERE p."user_id" = u."id"
    `);

    // 3. Eliminar la tabla de perfil
    await queryRunner.query(`DROP TABLE "perfil_instructor"`);
  }
}
