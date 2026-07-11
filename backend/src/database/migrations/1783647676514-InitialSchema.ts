import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1783647676514 implements MigrationInterface {
  name = 'InitialSchema1783647676514';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_rol_enum" AS ENUM('admin', 'instructor', 'coordinador', 'aprendiz', 'desarrollador')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_dependencia_enum" AS ENUM('Articulacion', 'Titulada', 'Complementaria')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_estadodisponibilidad_enum" AS ENUM('Disponible', 'Parcial', 'Saturado')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "nombre" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "documento" character varying(20) NOT NULL, "telefono" character varying(20), "password" character varying(255) NOT NULL, "rol" "public"."users_rol_enum" NOT NULL DEFAULT 'instructor', "fotoPerfil" character varying(500), "activo" boolean NOT NULL DEFAULT true, "profesion" character varying(150), "dependencia" "public"."users_dependencia_enum", "area" character varying(150), "tipoPrograma" character varying(150), "sede" character varying(150), "fechaInicioContrato" date, "fechaFinContrato" date, "colegioArticulacion" character varying(200), "modalidadArticulacion" character varying(100), "jornadaArticulacion" character varying(50), "localidad" character varying(150), "estadoDisponibilidad" "public"."users_estadodisponibilidad_enum" DEFAULT 'Disponible', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_d84b4115f335f51566778cd10bc" UNIQUE ("documento"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "colegios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "nombre" character varying(200) NOT NULL, "nit" character varying(20) NOT NULL, "direccion" character varying(300) NOT NULL, "ciudad" character varying(100) NOT NULL, "departamento" character varying(100) NOT NULL, "telefono" character varying(20), "email" character varying(100), "rector" character varying(200), "activo" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_5314f98159284089b62dd7a1cc8" UNIQUE ("nit"), CONSTRAINT "PK_0ae630c636087aa3e5cbe45326f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."programas_nivelformacion_enum" AS ENUM('TECNICO', 'TECNOLOGO', 'ESPECIALIZACION', 'OPERARIO', 'AUXILIAR')`,
    );
    await queryRunner.query(
      `CREATE TABLE "programas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "nombre" character varying(300) NOT NULL, "codigo" character varying(20) NOT NULL, "nivelFormacion" "public"."programas_nivelformacion_enum" NOT NULL, "areaConocimiento" character varying(200) NOT NULL, "duracionMeses" integer NOT NULL, "totalHoras" integer NOT NULL, "descripcion" text, "requisitos" character varying(500), "activo" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_a8f35cc524fd6247af4b3e08805" UNIQUE ("codigo"), CONSTRAINT "PK_0eb3b38bfa274b4cbf0882232c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."fichas_jornada_enum" AS ENUM('MAÑANA', 'TARDE', 'NOCHE', 'MIXTA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."fichas_estado_enum" AS ENUM('ACTIVA', 'EN_CIERRE', 'FINALIZADA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."fichas_dependencia_enum" AS ENUM('ARTICULACION', 'TITULADA', 'COMPLEMENTARIA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."fichas_modalidadarticulacion_enum" AS ENUM('COMPARTIDA', 'UNICA', 'COLEGIO_PRIVADO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "fichas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "numeroFicha" character varying(30) NOT NULL, "jornada" "public"."fichas_jornada_enum" NOT NULL, "estado" "public"."fichas_estado_enum" NOT NULL DEFAULT 'ACTIVA', "fechaInicio" date, "fechaFin" date, "colegio_id" uuid, "programa_id" uuid, "instructor_id" uuid, "dependencia" "public"."fichas_dependencia_enum" NOT NULL DEFAULT 'TITULADA', "tipoProgramaFormacion" character varying(200), "cupoEsperado" integer NOT NULL DEFAULT '30', "modalidadArticulacion" "public"."fichas_modalidadarticulacion_enum", "localidad" character varying(200), "ambiente" character varying(200), "observaciones" text, CONSTRAINT "UQ_c37d5bcb14f4de83e7671837b72" UNIQUE ("numeroFicha"), CONSTRAINT "PK_25bf956e31efb0e2ae8515325b6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."aprendices_tipodocumento_enum" AS ENUM('CC', 'TI', 'CE', 'PAS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."aprendices_estadoacademico_enum" AS ENUM('ACTIVO', 'DESERTOR', 'RETIRADO', 'SUSPENDIDO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "aprendices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "nombres" character varying(100) NOT NULL, "apellidos" character varying(100) NOT NULL, "tipoDocumento" "public"."aprendices_tipodocumento_enum" NOT NULL, "documento" character varying(20) NOT NULL, "email" character varying(100), "telefono" character varying(20), "direccion" character varying(300), "estadoAcademico" "public"."aprendices_estadoacademico_enum" NOT NULL DEFAULT 'ACTIVO', "user_id" uuid NOT NULL, "ficha_id" uuid NOT NULL, CONSTRAINT "UQ_228cb36a82d3141dc0b0b4c33b6" UNIQUE ("documento"), CONSTRAINT "UQ_c2b7df10c1a277e33f811b48d59" UNIQUE ("email"), CONSTRAINT "PK_940d9e421d76a30b76641ea2fe8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."case_actions_tipo_enum" AS ENUM('LLAMADO_ATENCION', 'COMPROMISO', 'CITACION', 'OBSERVACION', 'CIERRE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "case_actions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "case_id" uuid NOT NULL, "tipo" "public"."case_actions_tipo_enum" NOT NULL, "descripcion" text NOT NULL, "evidencia_url" character varying(500), "fecha_compromiso" date, "responsable" character varying(200), CONSTRAINT "PK_8b999ee896ebcdf6702df306fb3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."disciplinary_cases_tipo_enum" AS ENUM('CONVIVENCIA', 'ACADEMICO', 'ASISTENCIA', 'OTRO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."disciplinary_cases_gravedad_enum" AS ENUM('LEVE', 'MEDIA', 'ALTA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."disciplinary_cases_estado_enum" AS ENUM('BORRADOR', 'ABIERTO', 'SEGUIMIENTO', 'CERRADO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "disciplinary_cases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "ficha_id" uuid NOT NULL, "aprendiz_id" uuid NOT NULL, "tipo" "public"."disciplinary_cases_tipo_enum" NOT NULL, "gravedad" "public"."disciplinary_cases_gravedad_enum" NOT NULL, "asunto" character varying(200) NOT NULL, "descripcion" text NOT NULL, "fecha_incidente" date NOT NULL, "estado" "public"."disciplinary_cases_estado_enum" NOT NULL DEFAULT 'BORRADOR', "assigned_to_id" uuid, "evidencia_url" character varying(500), "cierre_resumen" text, CONSTRAINT "PK_65a99708f6bdcd565ed35ac3335" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ptc_items_tipo_enum" AS ENUM('COMPROMISO_APRENDIZ', 'COMPROMISO_INSTRUCTOR', 'COMPROMISO_ACUDIENTE', 'OTRO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ptc_items_estado_enum" AS ENUM('PENDIENTE', 'CUMPLIDO', 'INCUMPLIDO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ptc_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "ptc_id" uuid NOT NULL, "tipo" "public"."ptc_items_tipo_enum" NOT NULL, "descripcion" text NOT NULL, "fecha_compromiso" date NOT NULL, "responsable_nombre" character varying(255), "estado" "public"."ptc_items_estado_enum" NOT NULL DEFAULT 'PENDIENTE', "evidencia_url" character varying(500), "notas" text, CONSTRAINT "PK_3e15c17ac9b7011983f724f781a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ptc_estado_enum" AS ENUM('BORRADOR', 'VIGENTE', 'CERRADO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ptc" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "ficha_id" uuid NOT NULL, "aprendiz_id" uuid NOT NULL, "caso_disciplinario_id" uuid, "motivo" character varying(255) NOT NULL, "descripcion" text NOT NULL, "fecha_inicio" date NOT NULL, "fecha_fin" date, "estado" "public"."ptc_estado_enum" NOT NULL DEFAULT 'BORRADOR', "cierre_resumen" text, CONSTRAINT "PK_970a3bffe78830123a01facb711" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."actas_estado_enum" AS ENUM('BORRADOR', 'FIRMABLE', 'CERRADA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "actas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "ficha_id" uuid NOT NULL, "aprendiz_id" uuid NOT NULL, "ptc_id" uuid, "caso_disciplinario_id" uuid, "fecha_reunion" TIMESTAMP NOT NULL, "lugar" character varying(255), "asunto" character varying(500) NOT NULL, "desarrollo" text NOT NULL, "acuerdos" text NOT NULL, "estado" "public"."actas_estado_enum" NOT NULL DEFAULT 'BORRADOR', "cierre_resumen" text, "pdf_url" character varying(500), "hash" character varying(100), CONSTRAINT "PK_ad14a36fb27ce9a7ee5a0418e71" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."acta_asistentes_rol_enum" AS ENUM('APRENDIZ', 'INSTRUCTOR', 'COORDINADOR', 'ACUDIENTE', 'OTRO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "acta_asistentes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "acta_id" uuid NOT NULL, "nombre" character varying(255) NOT NULL, "rol" "public"."acta_asistentes_rol_enum" NOT NULL, "email" character varying(255), "telefono" character varying(20), CONSTRAINT "PK_4d41314dc8e50419d9d8d66de1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."planeaciones_dependencia_enum" AS ENUM('ARTICULACION', 'TITULADA', 'COMPLEMENTARIA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."planeaciones_estado_enum" AS ENUM('ACTIVA', 'REASIGNADA', 'PARCIAL', 'PENDIENTE', 'CERRADA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."planeaciones_modalidad_enum" AS ENUM('COMPARTIDA', 'UNICA', 'COLEGIO_PRIVADO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "planeaciones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "dependencia" "public"."planeaciones_dependencia_enum" NOT NULL, "fichaId" uuid, "instructorId" uuid, "ambienteId" uuid, "fichaNumero" character varying(30) NOT NULL, "programa" character varying(200) NOT NULL, "instructorNombre" character varying(100) NOT NULL, "instructorArea" character varying(150), "ambienteNombre" character varying(100), "bloques" text, "horasAsignadas" integer NOT NULL DEFAULT '0', "estado" "public"."planeaciones_estado_enum" NOT NULL DEFAULT 'ACTIVA', "notas" text, "siteContext" character varying(100), "schoolId" character varying(100), "schoolName" character varying(200), "localidad" character varying(150), "modalidad" "public"."planeaciones_modalidad_enum", "jornada" character varying(20), "fechaInicio" date, "fechaFin" date, CONSTRAINT "PK_dc0defa50710ad30ebfbe95dbb6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_tipo_enum" AS ENUM('RECORDATORIO', 'EVENTO_CREADO', 'EVENTO_CANCELADO', 'EVENTO_ACTUALIZADO', 'OTRO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "user_id" uuid NOT NULL, "titulo" character varying(120) NOT NULL, "mensaje" text NOT NULL, "tipo" "public"."notifications_tipo_enum" NOT NULL, "entity_type" character varying(50), "entity_id" uuid, "read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."planeacion_historial_accion_enum" AS ENUM('CREADA', 'EDITADA', 'REASIGNADA', 'CERRADA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "planeacion_historial" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "planeacionId" uuid, "accion" "public"."planeacion_historial_accion_enum" NOT NULL, "dependencia" character varying(50) NOT NULL, "fichaNumero" character varying(30) NOT NULL, "instructorNombre" character varying(100) NOT NULL, "resumen" text, "actor" character varying(100), "ocurrioEn" character varying(50), CONSTRAINT "PK_1db870c4b295a781c614f142997" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "asistencias" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "sesion_id" uuid NOT NULL, "aprendiz_id" uuid NOT NULL, "presente" boolean NOT NULL DEFAULT false, "justificada" boolean NOT NULL DEFAULT false, "motivoJustificacion" text, "evidenciaUrl" character varying(500), CONSTRAINT "UQ_1ead67a817f3e4d74034bb57c8f" UNIQUE ("sesion_id", "aprendiz_id"), CONSTRAINT "PK_f7eb09d44d6c7dd4ccc6eb29af8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "clase_sesiones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "ficha_id" uuid NOT NULL, "fecha" date NOT NULL, "tema" character varying(300), "observaciones" text, "created_by_user_id" uuid, CONSTRAINT "UQ_f782c5121334d49c9ecb2da9f88" UNIQUE ("ficha_id", "fecha"), CONSTRAINT "PK_720037c895b725606552dcc66f6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ambientes_tipo_enum" AS ENUM('TITULADA', 'COMPLEMENTARIA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ambientes_estado_enum" AS ENUM('ACTIVO', 'MANTENIMIENTO', 'INACTIVO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ambientes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "nombre" character varying(100) NOT NULL, "sede" character varying(100) NOT NULL, "capacidad" integer NOT NULL DEFAULT '30', "tipo" "public"."ambientes_tipo_enum" NOT NULL, "estado" "public"."ambientes_estado_enum" NOT NULL DEFAULT 'ACTIVO', "descripcion" text, "equipamiento" character varying(255), CONSTRAINT "PK_a90809c19133ae8e8739e6a0038" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."asignaciones_ambiente_dia_enum" AS ENUM('LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."asignaciones_ambiente_jornada_enum" AS ENUM('MANANA', 'TARDE', 'NOCHE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "asignaciones_ambiente" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "ambiente_id" uuid NOT NULL, "ficha_id" uuid, "instructor_id" uuid, "dia" "public"."asignaciones_ambiente_dia_enum" NOT NULL, "jornada" "public"."asignaciones_ambiente_jornada_enum" NOT NULL, "notas" text, CONSTRAINT "UQ_72e722a1537c0179e2980d8aeb8" UNIQUE ("ambiente_id", "dia", "jornada"), CONSTRAINT "PK_3043bd08bf6d833db91e6ac5b16" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reminders_canal_enum" AS ENUM('IN_APP', 'EMAIL', 'SMS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reminders_estado_enum" AS ENUM('PENDIENTE', 'ENVIADO', 'CANCELADO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reminders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "event_id" uuid NOT NULL, "remind_at" TIMESTAMP NOT NULL, "canal" "public"."reminders_canal_enum" NOT NULL DEFAULT 'IN_APP', "estado" "public"."reminders_estado_enum" NOT NULL DEFAULT 'PENDIENTE', "mensaje" text, "sent_at" TIMESTAMP, CONSTRAINT "PK_38715fec7f634b72c6cf7ea4893" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."calendar_events_tipo_enum" AS ENUM('CLASE', 'REUNION', 'CITACION', 'COMPROMISO', 'OTRO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."calendar_events_estado_enum" AS ENUM('PROGRAMADO', 'CANCELADO', 'COMPLETADO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."calendar_events_prioridad_enum" AS ENUM('BAJA', 'MEDIA', 'ALTA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "calendar_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "titulo" character varying(120) NOT NULL, "descripcion" text, "tipo" "public"."calendar_events_tipo_enum" NOT NULL, "fecha_inicio" TIMESTAMP NOT NULL, "fecha_fin" TIMESTAMP, "all_day" boolean NOT NULL DEFAULT false, "estado" "public"."calendar_events_estado_enum" NOT NULL DEFAULT 'PROGRAMADO', "prioridad" "public"."calendar_events_prioridad_enum" DEFAULT 'MEDIA', "ficha_id" uuid, "aprendiz_id" uuid, "caso_disciplinario_id" uuid, "ptc_id" uuid, "acta_id" uuid, "created_by_user_id" uuid NOT NULL, "assigned_to_id" uuid, CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."acudientes_parentesco_enum" AS ENUM('MADRE', 'PADRE', 'HERMANO', 'TIO', 'ABUELO', 'OTRO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "acudientes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by_id" uuid, "updated_by_id" uuid, "deleted_by_id" uuid, "nombres" character varying(100) NOT NULL, "apellidos" character varying(100), "telefono" character varying(20) NOT NULL, "email" character varying(100), "parentesco" "public"."acudientes_parentesco_enum" NOT NULL, "aprendiz_id" uuid NOT NULL, CONSTRAINT "PK_c9736dc0a968f1b4465850e8e41" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "fichas" ADD CONSTRAINT "FK_d6ed4c9f95eea0213b724ba2e04" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fichas" ADD CONSTRAINT "FK_f21a5ba6210bd1b910f5082aed5" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fichas" ADD CONSTRAINT "FK_0deb54ae9e6d1c63871b8c1bdaf" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "aprendices" ADD CONSTRAINT "FK_a81d501f8596468820178507872" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "aprendices" ADD CONSTRAINT "FK_85d0ab3dab816f12518ee310a76" FOREIGN KEY ("ficha_id") REFERENCES "fichas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "case_actions" ADD CONSTRAINT "FK_35638f23970b3b8a3a5170be780" FOREIGN KEY ("case_id") REFERENCES "disciplinary_cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciplinary_cases" ADD CONSTRAINT "FK_c34b639117bb6de73464db1c140" FOREIGN KEY ("ficha_id") REFERENCES "fichas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciplinary_cases" ADD CONSTRAINT "FK_467a565e3e15ac28dd94cc0724f" FOREIGN KEY ("aprendiz_id") REFERENCES "aprendices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciplinary_cases" ADD CONSTRAINT "FK_5b00f9ea011cef9a81f334a37d7" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ptc_items" ADD CONSTRAINT "FK_6f35f256a408eacb83bb2cba66b" FOREIGN KEY ("ptc_id") REFERENCES "ptc"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ptc_items" ADD CONSTRAINT "FK_5c32acaa11f3cfdfeaa3f131724" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ptc" ADD CONSTRAINT "FK_1a679f3a10ce0f0e4ee897acd24" FOREIGN KEY ("ficha_id") REFERENCES "fichas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ptc" ADD CONSTRAINT "FK_e2a3b81a44d9e74606a4dea67c3" FOREIGN KEY ("aprendiz_id") REFERENCES "aprendices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ptc" ADD CONSTRAINT "FK_890b72d5c3b82502898c26117de" FOREIGN KEY ("caso_disciplinario_id") REFERENCES "disciplinary_cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ptc" ADD CONSTRAINT "FK_6ded0a9c947a1f317443c9b9300" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "actas" ADD CONSTRAINT "FK_335a299278e47fb85e425a41758" FOREIGN KEY ("ficha_id") REFERENCES "fichas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "actas" ADD CONSTRAINT "FK_146fe850100d2a252e62c9fe011" FOREIGN KEY ("aprendiz_id") REFERENCES "aprendices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "actas" ADD CONSTRAINT "FK_9e756029e16f0941d306f89bd48" FOREIGN KEY ("ptc_id") REFERENCES "ptc"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "actas" ADD CONSTRAINT "FK_a1a33908c0537f8b569b74e7644" FOREIGN KEY ("caso_disciplinario_id") REFERENCES "disciplinary_cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "actas" ADD CONSTRAINT "FK_bdfcc60a7279356de8cc7b2c303" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "acta_asistentes" ADD CONSTRAINT "FK_f25471ec431a6bfc802a3193082" FOREIGN KEY ("acta_id") REFERENCES "actas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_66b0e76afc995de2476e6c34d69" FOREIGN KEY ("sesion_id") REFERENCES "clase_sesiones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_f42ff203cb07ce0ce8fe49c0566" FOREIGN KEY ("aprendiz_id") REFERENCES "aprendices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_sesiones" ADD CONSTRAINT "FK_465dcb499924bd28a4f751e5b2f" FOREIGN KEY ("ficha_id") REFERENCES "fichas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_sesiones" ADD CONSTRAINT "FK_1cec368b01dea89ac55a44d80f1" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asignaciones_ambiente" ADD CONSTRAINT "FK_a71b3aa2d48406ce7b9e0f29e8a" FOREIGN KEY ("ambiente_id") REFERENCES "ambientes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asignaciones_ambiente" ADD CONSTRAINT "FK_35d6da7186b5681256d5ee6c96f" FOREIGN KEY ("ficha_id") REFERENCES "fichas"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asignaciones_ambiente" ADD CONSTRAINT "FK_383bdbead48e3db63fac6dba180" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminders" ADD CONSTRAINT "FK_60b4c0ece7c9236aa07bc883ea2" FOREIGN KEY ("event_id") REFERENCES "calendar_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_dbbd5862ad7d3f414f8280a3de2" FOREIGN KEY ("ficha_id") REFERENCES "fichas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_e146fb09b8f342a86b262e6831b" FOREIGN KEY ("aprendiz_id") REFERENCES "aprendices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_12c03a44157672f446361b828a7" FOREIGN KEY ("caso_disciplinario_id") REFERENCES "disciplinary_cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_005fc05b1a4b24da9c89c6f056c" FOREIGN KEY ("ptc_id") REFERENCES "ptc"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_7c14f97a39d80821bd3e4403b47" FOREIGN KEY ("acta_id") REFERENCES "actas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_217db9d0096f2a6009e55e40d94" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_24ee7a77d298bf5c3facf898c4a" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "acudientes" ADD CONSTRAINT "FK_027f02f1836de86a219229eda8d" FOREIGN KEY ("aprendiz_id") REFERENCES "aprendices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "acudientes" DROP CONSTRAINT "FK_027f02f1836de86a219229eda8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_24ee7a77d298bf5c3facf898c4a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_217db9d0096f2a6009e55e40d94"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_7c14f97a39d80821bd3e4403b47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_005fc05b1a4b24da9c89c6f056c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_12c03a44157672f446361b828a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_e146fb09b8f342a86b262e6831b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_dbbd5862ad7d3f414f8280a3de2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminders" DROP CONSTRAINT "FK_60b4c0ece7c9236aa07bc883ea2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asignaciones_ambiente" DROP CONSTRAINT "FK_383bdbead48e3db63fac6dba180"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asignaciones_ambiente" DROP CONSTRAINT "FK_35d6da7186b5681256d5ee6c96f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asignaciones_ambiente" DROP CONSTRAINT "FK_a71b3aa2d48406ce7b9e0f29e8a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_sesiones" DROP CONSTRAINT "FK_1cec368b01dea89ac55a44d80f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_sesiones" DROP CONSTRAINT "FK_465dcb499924bd28a4f751e5b2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_f42ff203cb07ce0ce8fe49c0566"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_66b0e76afc995de2476e6c34d69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "acta_asistentes" DROP CONSTRAINT "FK_f25471ec431a6bfc802a3193082"`,
    );
    await queryRunner.query(`ALTER TABLE "actas" DROP CONSTRAINT "FK_bdfcc60a7279356de8cc7b2c303"`);
    await queryRunner.query(`ALTER TABLE "actas" DROP CONSTRAINT "FK_a1a33908c0537f8b569b74e7644"`);
    await queryRunner.query(`ALTER TABLE "actas" DROP CONSTRAINT "FK_9e756029e16f0941d306f89bd48"`);
    await queryRunner.query(`ALTER TABLE "actas" DROP CONSTRAINT "FK_146fe850100d2a252e62c9fe011"`);
    await queryRunner.query(`ALTER TABLE "actas" DROP CONSTRAINT "FK_335a299278e47fb85e425a41758"`);
    await queryRunner.query(`ALTER TABLE "ptc" DROP CONSTRAINT "FK_6ded0a9c947a1f317443c9b9300"`);
    await queryRunner.query(`ALTER TABLE "ptc" DROP CONSTRAINT "FK_890b72d5c3b82502898c26117de"`);
    await queryRunner.query(`ALTER TABLE "ptc" DROP CONSTRAINT "FK_e2a3b81a44d9e74606a4dea67c3"`);
    await queryRunner.query(`ALTER TABLE "ptc" DROP CONSTRAINT "FK_1a679f3a10ce0f0e4ee897acd24"`);
    await queryRunner.query(
      `ALTER TABLE "ptc_items" DROP CONSTRAINT "FK_5c32acaa11f3cfdfeaa3f131724"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ptc_items" DROP CONSTRAINT "FK_6f35f256a408eacb83bb2cba66b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciplinary_cases" DROP CONSTRAINT "FK_5b00f9ea011cef9a81f334a37d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciplinary_cases" DROP CONSTRAINT "FK_467a565e3e15ac28dd94cc0724f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disciplinary_cases" DROP CONSTRAINT "FK_c34b639117bb6de73464db1c140"`,
    );
    await queryRunner.query(
      `ALTER TABLE "case_actions" DROP CONSTRAINT "FK_35638f23970b3b8a3a5170be780"`,
    );
    await queryRunner.query(
      `ALTER TABLE "aprendices" DROP CONSTRAINT "FK_85d0ab3dab816f12518ee310a76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "aprendices" DROP CONSTRAINT "FK_a81d501f8596468820178507872"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fichas" DROP CONSTRAINT "FK_0deb54ae9e6d1c63871b8c1bdaf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fichas" DROP CONSTRAINT "FK_f21a5ba6210bd1b910f5082aed5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fichas" DROP CONSTRAINT "FK_d6ed4c9f95eea0213b724ba2e04"`,
    );
    await queryRunner.query(`DROP TABLE "acudientes"`);
    await queryRunner.query(`DROP TYPE "public"."acudientes_parentesco_enum"`);
    await queryRunner.query(`DROP TABLE "calendar_events"`);
    await queryRunner.query(`DROP TYPE "public"."calendar_events_prioridad_enum"`);
    await queryRunner.query(`DROP TYPE "public"."calendar_events_estado_enum"`);
    await queryRunner.query(`DROP TYPE "public"."calendar_events_tipo_enum"`);
    await queryRunner.query(`DROP TABLE "reminders"`);
    await queryRunner.query(`DROP TYPE "public"."reminders_estado_enum"`);
    await queryRunner.query(`DROP TYPE "public"."reminders_canal_enum"`);
    await queryRunner.query(`DROP TABLE "asignaciones_ambiente"`);
    await queryRunner.query(`DROP TYPE "public"."asignaciones_ambiente_jornada_enum"`);
    await queryRunner.query(`DROP TYPE "public"."asignaciones_ambiente_dia_enum"`);
    await queryRunner.query(`DROP TABLE "ambientes"`);
    await queryRunner.query(`DROP TYPE "public"."ambientes_estado_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ambientes_tipo_enum"`);
    await queryRunner.query(`DROP TABLE "clase_sesiones"`);
    await queryRunner.query(`DROP TABLE "asistencias"`);
    await queryRunner.query(`DROP TABLE "planeacion_historial"`);
    await queryRunner.query(`DROP TYPE "public"."planeacion_historial_accion_enum"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_tipo_enum"`);
    await queryRunner.query(`DROP TABLE "planeaciones"`);
    await queryRunner.query(`DROP TYPE "public"."planeaciones_modalidad_enum"`);
    await queryRunner.query(`DROP TYPE "public"."planeaciones_estado_enum"`);
    await queryRunner.query(`DROP TYPE "public"."planeaciones_dependencia_enum"`);
    await queryRunner.query(`DROP TABLE "acta_asistentes"`);
    await queryRunner.query(`DROP TYPE "public"."acta_asistentes_rol_enum"`);
    await queryRunner.query(`DROP TABLE "actas"`);
    await queryRunner.query(`DROP TYPE "public"."actas_estado_enum"`);
    await queryRunner.query(`DROP TABLE "ptc"`);
    await queryRunner.query(`DROP TYPE "public"."ptc_estado_enum"`);
    await queryRunner.query(`DROP TABLE "ptc_items"`);
    await queryRunner.query(`DROP TYPE "public"."ptc_items_estado_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ptc_items_tipo_enum"`);
    await queryRunner.query(`DROP TABLE "disciplinary_cases"`);
    await queryRunner.query(`DROP TYPE "public"."disciplinary_cases_estado_enum"`);
    await queryRunner.query(`DROP TYPE "public"."disciplinary_cases_gravedad_enum"`);
    await queryRunner.query(`DROP TYPE "public"."disciplinary_cases_tipo_enum"`);
    await queryRunner.query(`DROP TABLE "case_actions"`);
    await queryRunner.query(`DROP TYPE "public"."case_actions_tipo_enum"`);
    await queryRunner.query(`DROP TABLE "aprendices"`);
    await queryRunner.query(`DROP TYPE "public"."aprendices_estadoacademico_enum"`);
    await queryRunner.query(`DROP TYPE "public"."aprendices_tipodocumento_enum"`);
    await queryRunner.query(`DROP TABLE "fichas"`);
    await queryRunner.query(`DROP TYPE "public"."fichas_modalidadarticulacion_enum"`);
    await queryRunner.query(`DROP TYPE "public"."fichas_dependencia_enum"`);
    await queryRunner.query(`DROP TYPE "public"."fichas_estado_enum"`);
    await queryRunner.query(`DROP TYPE "public"."fichas_jornada_enum"`);
    await queryRunner.query(`DROP TABLE "programas"`);
    await queryRunner.query(`DROP TYPE "public"."programas_nivelformacion_enum"`);
    await queryRunner.query(`DROP TABLE "colegios"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_estadodisponibilidad_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_dependencia_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_rol_enum"`);
  }
}
