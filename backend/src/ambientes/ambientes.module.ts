import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmbientesService } from './ambientes.service';
import { AmbientesController } from './ambientes.controller';
import { Ambiente } from './entities/ambiente.entity';
import { AsignacionAmbiente } from './entities/asignacion-ambiente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ambiente, AsignacionAmbiente])],
  controllers: [AmbientesController],
  providers: [AmbientesService],
  exports: [AmbientesService],
})
export class AmbientesModule {}
