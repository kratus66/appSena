import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { ColegiosModule } from '../colegios/colegios.module';
import { ProgramasModule } from '../programas/programas.module';
import { UsersModule } from '../users/users.module';
import { FichasModule } from '../fichas/fichas.module';
import { AprendicesModule } from '../aprendices/aprendices.module';
import { DisciplinarioModule } from '../disciplinario/disciplinario.module';

@Module({
  imports: [
    UsersModule,
    ColegiosModule,
    ProgramasModule,
    FichasModule,
    AprendicesModule,
    DisciplinarioModule,
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
