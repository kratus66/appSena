import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean, IsString, ValidateIf, IsOptional, MaxLength } from 'class-validator';

export class JustificarAsistenciaDto {
  @ApiProperty({
    description: 'Indica si la ausencia está justificada',
    example: true,
  })
  @IsNotEmpty({ message: 'El campo justificada es obligatorio' })
  @IsBoolean({ message: 'El campo justificada debe ser un booleano' })
  justificada: boolean;

  @ApiProperty({
    description: 'Motivo de la justificación (obligatorio si justificada es true)',
    example: 'Cita médica',
  })
  @ValidateIf((o) => o.justificada === true)
  @IsNotEmpty({ message: 'El motivo de justificación es obligatorio cuando justificada es true' })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  motivoJustificacion: string;

  @ApiProperty({
    description: 'URL de evidencia de justificación (opcional)',
    example: 'https://example.com/evidencia.pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La evidencia debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La URL de evidencia no puede exceder los 500 caracteres' })
  evidenciaUrl?: string;
}
