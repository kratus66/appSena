import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcudientesController } from './acudientes.controller';
import { AcudientesService } from './acudientes.service';
import { Acudiente } from './entities/acudiente.entity';
import { AprendicesModule } from '../aprendices/aprendices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Acudiente]),
    AprendicesModule, // Para poder inyectar AprendicesService
  ],
  controllers: [AcudientesController],
  providers: [AcudientesService],
  exports: [AcudientesService],
})
export class AcudientesModule {}
