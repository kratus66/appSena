import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaController } from './agenda.controller';
import { AgendaService } from './agenda.service';
import { CalendarEvent } from './entities/calendar-event.entity';
import { Reminder } from './entities/reminder.entity';
import { FichasModule } from '../fichas/fichas.module';
import { AprendicesModule } from '../aprendices/aprendices.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEvent, Reminder]),
    FichasModule,
    AprendicesModule,
    NotificacionesModule,
  ],
  controllers: [AgendaController],
  providers: [AgendaService],
  exports: [AgendaService],
})
export class AgendaModule {}
