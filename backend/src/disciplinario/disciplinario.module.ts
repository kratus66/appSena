import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisciplinarioController } from './disciplinario.controller';
import { DisciplinarioService } from './disciplinario.service';
import { DisciplinaryCase } from './entities/disciplinary-case.entity';
import { CaseAction } from './entities/case-action.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { Aprendiz } from '../aprendices/entities/aprendiz.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DisciplinaryCase,
      CaseAction,
      Ficha,
      Aprendiz,
    ]),
  ],
  controllers: [DisciplinarioController],
  providers: [DisciplinarioService],
  exports: [DisciplinarioService],
})
export class DisciplinarioModule {}
