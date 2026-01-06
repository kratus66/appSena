import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { ColegiosModule } from '../colegios/colegios.module';
import { ProgramasModule } from '../programas/programas.module';
import { UsersModule } from '../users/users.module';
import { FichasModule } from '../fichas/fichas.module';

@Module({
  imports: [UsersModule, ColegiosModule, ProgramasModule, FichasModule],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
