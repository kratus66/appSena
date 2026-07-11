import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { buildLoggerOptions } from './common/logger.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ColegiosModule } from './colegios/colegios.module';
import { ProgramasModule } from './programas/programas.module';
import { SeederModule } from './database/seeder.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FichasModule } from './fichas/fichas.module';
import { AprendicesModule } from './aprendices/aprendices.module';
import { AcudientesModule } from './acudientes/acudientes.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { DisciplinarioModule } from './disciplinario/disciplinario.module';
import { UploadModule } from './upload/upload.module';
import { PtcModule } from './ptc/ptc.module';
import { AgendaModule } from './agenda/agenda.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ReportesModule } from './reportes/reportes.module';
import { AmbientesModule } from './ambientes/ambientes.module';
import { Ambiente } from './ambientes/entities/ambiente.entity';
import { AsignacionAmbiente } from './ambientes/entities/asignacion-ambiente.entity';
import { PlaneacionModule } from './planeacion/planeacion.module';
import { Planeacion } from './planeacion/entities/planeacion.entity';
import { PlaneacionHistorial } from './planeacion/entities/planeacion-historial.entity';
import { User } from './users/entities/user.entity';
import { PerfilInstructor } from './users/entities/perfil-instructor.entity';
import { Colegio } from './colegios/entities/colegio.entity';
import { Programa } from './programas/entities/programa.entity';
import { Ficha } from './fichas/entities/ficha.entity';
import { Aprendiz } from './aprendices/entities/aprendiz.entity';
import { Acudiente } from './acudientes/entities/acudiente.entity';
import { ClaseSesion } from './asistencias/entities/clase-sesion.entity';
import { Asistencia } from './asistencias/entities/asistencia.entity';
import { DisciplinaryCase } from './disciplinario/entities/disciplinary-case.entity';
import { CaseAction } from './disciplinario/entities/case-action.entity';
import { Ptc } from './ptc/entities/ptc.entity';
import { PtcItem } from './ptc/entities/ptc-item.entity';
import { Acta } from './ptc/entities/acta.entity';
import { ActaAsistente } from './ptc/entities/acta-asistente.entity';
import { CalendarEvent } from './agenda/entities/calendar-event.entity';
import { Reminder } from './agenda/entities/reminder.entity';
import { Notification } from './notificaciones/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRoot(buildLoggerOptions()),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [
          User,
          PerfilInstructor,
          Colegio,
          Programa,
          Ficha,
          Aprendiz,
          Acudiente,
          ClaseSesion,
          Asistencia,
          DisciplinaryCase,
          CaseAction,
          Ptc,
          PtcItem,
          Acta,
          ActaAsistente,
          CalendarEvent,
          Reminder,
          Notification,
          Ambiente,
          AsignacionAmbiente,
          Planeacion,
          PlaneacionHistorial,
        ],
        // El esquema es responsabilidad exclusiva de las migraciones
        // (src/database/migrations). Nunca auto-sincronizar: evita el drift
        // entre lo que TypeORM infiere de las entidades y lo que realmente
        // hay en la base de datos.
        synchronize: false,
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        // Correr migraciones automáticamente al arrancar solo si se pide
        // explícitamente (ej. despliegue de una sola instancia). En local se
        // corren con `npm run migration:run`.
        migrationsRun: configService.get('DB_MIGRATIONS_RUN') === 'true',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ColegiosModule,
    ProgramasModule,
    FichasModule,
    AprendicesModule,
    AcudientesModule,
    AsistenciasModule,
    DisciplinarioModule,
    PtcModule,
    AgendaModule,
    NotificacionesModule,
    ReportesModule,
    AmbientesModule,
    PlaneacionModule,
    UploadModule,
    SeederModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
