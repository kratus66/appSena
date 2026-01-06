import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { ClaseSesion } from './entities/clase-sesion.entity';
import { Asistencia } from './entities/asistencia.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { Aprendiz } from '../aprendices/entities/aprendiz.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClaseSesion, Asistencia, Ficha, Aprendiz]),
  ],
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
  exports: [AsistenciasService],
})
export class AsistenciasModule {}
