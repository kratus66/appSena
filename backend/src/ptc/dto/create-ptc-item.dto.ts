import { IsString, IsDateString, IsEnum, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PtcItemTipo, PtcItemEstado } from '../entities/ptc-item.entity';

export class CreatePtcItemDto {
  @ApiProperty({
    description: 'Tipo de compromiso',
    enum: PtcItemTipo,
    example: PtcItemTipo.COMPROMISO_APRENDIZ,
  })
  @IsEnum(PtcItemTipo)
  @IsNotEmpty()
  tipo: PtcItemTipo;

  @ApiProperty({
    description: 'Descripción del compromiso',
    example: 'Asistir a tutorías de refuerzo los martes y jueves',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    description: 'Fecha compromiso de cumplimiento',
    example: '2026-02-15',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaCompromiso: string;

  @ApiProperty({
    description: 'Nombre del responsable (opcional)',
    example: 'María García - Acudiente',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  responsableNombre?: string;

  @ApiProperty({
    description: 'Estado inicial (opcional, default PENDIENTE)',
    enum: PtcItemEstado,
    example: PtcItemEstado.PENDIENTE,
    required: false,
  })
  @IsEnum(PtcItemEstado)
  @IsOptional()
  estado?: PtcItemEstado;
}
