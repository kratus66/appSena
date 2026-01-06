import { IsString, IsUUID, IsOptional, IsDateString, MaxLength, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PtcEstado } from '../entities/ptc.entity';

export class CreatePtcDto {
  @ApiProperty({
    description: 'ID de la ficha',
    example: 'uuid-ficha',
  })
  @IsUUID()
  @IsNotEmpty()
  fichaId: string;

  @ApiProperty({
    description: 'ID del aprendiz',
    example: 'uuid-aprendiz',
  })
  @IsUUID()
  @IsNotEmpty()
  aprendizId: string;

  @ApiProperty({
    description: 'ID del caso disciplinario (opcional)',
    example: 'uuid-caso',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  casoDisciplinarioId?: string;

  @ApiProperty({
    description: 'Motivo del PTC',
    example: 'Plan de mejoramiento académico',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  motivo: string;

  @ApiProperty({
    description: 'Descripción detallada',
    example: 'El aprendiz presenta bajo rendimiento en competencias técnicas...',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    description: 'Fecha de inicio del plan',
    example: '2026-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha estimada de finalización (opcional)',
    example: '2026-03-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaFin?: string;
}
