import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PtcItemEstado } from '../entities/ptc-item.entity';

export class UpdatePtcItemEstadoDto {
  @ApiProperty({
    description: 'Nuevo estado del compromiso',
    enum: PtcItemEstado,
    example: PtcItemEstado.CUMPLIDO,
  })
  @IsEnum(PtcItemEstado)
  estado: PtcItemEstado;

  @ApiProperty({
    description: 'URL de evidencia del cumplimiento (opcional)',
    example: 'https://bucket.s3.amazonaws.com/evidencia.pdf',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  evidenciaUrl?: string;

  @ApiProperty({
    description: 'Notas sobre el cumplimiento',
    example: 'Asistió a 6 de 8 sesiones programadas',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  notas?: string;
}
