import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { ClaseSesion } from '../asistencias/entities/clase-sesion.entity';
import { Asistencia } from '../asistencias/entities/asistencia.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { Aprendiz } from '../aprendices/entities/aprendiz.entity';
import { DisciplinaryCase } from '../disciplinario/entities/disciplinary-case.entity';
import { Ptc } from '../ptc/entities/ptc.entity';
import { CalendarEvent } from '../agenda/entities/calendar-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClaseSesion,
      Asistencia,
      Ficha,
      Aprendiz,
      DisciplinaryCase,
      Ptc,
      CalendarEvent,
    ]),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
