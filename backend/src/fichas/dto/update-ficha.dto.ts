import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateFichaDto } from './create-ficha.dto';

// Los instructores pueden actualizar todo excepto el estado (que solo cambian coordinadores)
export class UpdateFichaDto extends PartialType(
  OmitType(CreateFichaDto, ['estado'] as const),
) {}
