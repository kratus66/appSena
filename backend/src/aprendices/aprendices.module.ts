import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AprendicesService } from './aprendices.service';
import { AprendicesController } from './aprendices.controller';
import { Aprendiz } from './entities/aprendiz.entity';
import { Ficha } from '../fichas/entities/ficha.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Aprendiz, Ficha])],
  controllers: [AprendicesController],
  providers: [AprendicesService],
  exports: [AprendicesService],
})
export class AprendicesModule {}
