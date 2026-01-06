import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsString,
  MaxLength,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { CaseTipo, CaseGravedad } from '../entities/disciplinary-case.entity';

export class CreateCaseDto {
  @ApiProperty({
    description: 'ID de la ficha asociada',
    example: 'uuid-ficha',
  })
  @IsNotEmpty({ message: 'El fichaId es obligatorio' })
  @IsUUID('4', { message: 'El fichaId debe ser un UUID válido' })
  fichaId: string;

  @ApiProperty({
    description: 'ID del aprendiz involucrado',
    example: 'uuid-aprendiz',
  })
  @IsNotEmpty({ message: 'El aprendizId es obligatorio' })
  @IsUUID('4', { message: 'El aprendizId debe ser un UUID válido' })
  aprendizId: string;

  @ApiProperty({
    description: 'Tipo de caso disciplinario',
    enum: CaseTipo,
    example: 'CONVIVENCIA',
  })
  @IsNotEmpty({ message: 'El tipo de caso es obligatorio' })
  @IsEnum(CaseTipo, { message: 'El tipo debe ser uno de: CONVIVENCIA, ACADEMICO, ASISTENCIA, OTRO' })
  tipo: CaseTipo;

  @ApiProperty({
    description: 'Gravedad del caso',
    enum: CaseGravedad,
    example: 'MEDIA',
  })
  @IsNotEmpty({ message: 'La gravedad es obligatoria' })
  @IsEnum(CaseGravedad, { message: 'La gravedad debe ser una de: LEVE, MEDIA, ALTA' })
  gravedad: CaseGravedad;

  @ApiProperty({
    description: 'Asunto o título corto del caso',
    example: 'Comportamiento inadecuado en clase',
  })
  @IsNotEmpty({ message: 'El asunto es obligatorio' })
  @IsString({ message: 'El asunto debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El asunto no puede exceder los 200 caracteres' })
  asunto: string;

  @ApiProperty({
    description: 'Descripción detallada del incidente',
    example: 'El aprendiz mostró comportamiento disruptivo durante la sesión de formación...',
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string;

  @ApiProperty({
    description: 'Fecha en que ocurrió el incidente (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsNotEmpty({ message: 'La fecha del incidente es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida en formato ISO (YYYY-MM-DD)' })
  fechaIncidente: string;

  @ApiProperty({
    description: 'URL de evidencia del caso (opcional)',
    example: 'https://storage.example.com/evidencia.pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La URL de evidencia debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La URL de evidencia no puede exceder los 500 caracteres' })
  evidenciaUrl?: string;
}
