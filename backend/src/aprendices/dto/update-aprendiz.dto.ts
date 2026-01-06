import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAprendizDto } from './create-aprendiz.dto';

export class UpdateAprendizDto extends PartialType(
  OmitType(CreateAprendizDto, ['userId', 'fichaId', 'documento'] as const),
) {}
