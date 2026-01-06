import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColegiosService } from './colegios.service';
import { ColegiosController } from './colegios.controller';
import { Colegio } from './entities/colegio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Colegio])],
  controllers: [ColegiosController],
  providers: [ColegiosService],
  exports: [ColegiosService],
})
export class ColegiosModule {}
