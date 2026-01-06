import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AprendicesService } from './aprendices.service';
import { AprendicesController } from './aprendices.controller';
import { Aprendiz } from './entities/aprendiz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Aprendiz])],
  controllers: [AprendicesController],
  providers: [AprendicesService],
  exports: [AprendicesService],
})
export class AprendicesModule {}
