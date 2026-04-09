import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planeacion } from './entities/planeacion.entity';
import { PlaneacionHistorial } from './entities/planeacion-historial.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { AsignacionAmbiente } from '../ambientes/entities/asignacion-ambiente.entity';
import { PlaneacionService } from './planeacion.service';
import { PlaneacionController } from './planeacion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Planeacion, PlaneacionHistorial, Ficha, AsignacionAmbiente])],
  controllers: [PlaneacionController],
  providers: [PlaneacionService],
  exports: [PlaneacionService],
})
export class PlaneacionModule {}
