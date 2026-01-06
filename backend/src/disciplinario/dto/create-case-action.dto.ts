import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ActionTipo } from '../entities/case-action.entity';

export class CreateCaseActionDto {
  @ApiProperty({
    description: 'Tipo de acción o seguimiento',
    enum: ActionTipo,
    example: 'COMPROMISO',
  })
  @IsNotEmpty({ message: 'El tipo de acción es obligatorio' })
  @IsEnum(ActionTipo, {
    message:
      'El tipo debe ser uno de: LLAMADO_ATENCION, COMPROMISO, CITACION, OBSERVACION, CIERRE',
  })
  tipo: ActionTipo;

  @ApiProperty({
    description: 'Descripción detallada de la acción',
    example: 'Se estableció compromiso de mejora en comportamiento con seguimiento quincenal',
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string;

  @ApiProperty({
    description: 'URL de evidencia de la acción (opcional)',
    example: 'https://storage.example.com/compromiso-firmado.pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La URL de evidencia debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La URL de evidencia no puede exceder los 500 caracteres' })
  evidenciaUrl?: string;

  @ApiProperty({
    description: 'Fecha de compromiso (solo para tipo COMPROMISO, YYYY-MM-DD)',
    example: '2024-02-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe ser válida en formato ISO (YYYY-MM-DD)' })
  fechaCompromiso?: string;

  @ApiProperty({
    description: 'Responsable del compromiso (nombre o descripción)',
    example: 'Aprendiz Juan Pérez',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El responsable debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El responsable no puede exceder los 200 caracteres' })
  responsable?: string;
}
