import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PtcService } from './ptc.service';
import { PtcController } from './ptc.controller';
import { Ptc } from './entities/ptc.entity';
import { PtcItem } from './entities/ptc-item.entity';
import { Acta } from './entities/acta.entity';
import { ActaAsistente } from './entities/acta-asistente.entity';
import { FichasModule } from '../fichas/fichas.module';
import { AprendicesModule } from '../aprendices/aprendices.module';
import { DisciplinarioModule } from '../disciplinario/disciplinario.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ptc, PtcItem, Acta, ActaAsistente]),
    FichasModule,
    AprendicesModule,
    DisciplinarioModule,
    UploadModule,
  ],
  controllers: [PtcController],
  providers: [PtcService],
  exports: [PtcService],
})
export class PtcModule {}
