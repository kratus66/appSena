import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { AgendaSeeder } from './agenda-seeder';
import { ColegiosModule } from '../colegios/colegios.module';
import { ProgramasModule } from '../programas/programas.module';
import { UsersModule } from '../users/users.module';
import { FichasModule } from '../fichas/fichas.module';
import { AprendicesModule } from '../aprendices/aprendices.module';
import { DisciplinarioModule } from '../disciplinario/disciplinario.module';
import { CalendarEvent } from '../agenda/entities/calendar-event.entity';
import { Reminder } from '../agenda/entities/reminder.entity';
import { User } from '../users/entities/user.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { Aprendiz } from '../aprendices/entities/aprendiz.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEvent, Reminder, User, Ficha, Aprendiz]),
    UsersModule,
    ColegiosModule,
    ProgramasModule,
    FichasModule,
    AprendicesModule,
    DisciplinarioModule,
  ],
  providers: [SeederService, AgendaSeeder],
  exports: [SeederService],
})
export class SeederModule {}
