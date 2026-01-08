import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { User } from './users/entities/user.entity';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Colegio, Programa, Ficha, Aprendiz, Acudiente, ClaseSesion, Asistencia, DisciplinaryCase, CaseAction, Ptc, PtcItem, Acta, ActaAsistente, CalendarEvent, Reminder, Notification],
        synchronize: configService.get('NODE_ENV') === 'development',
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
    UploadModule,
    SeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
