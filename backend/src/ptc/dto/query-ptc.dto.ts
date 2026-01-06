import { IsOptional, IsUUID, IsEnum, IsDateString, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PtcEstado } from '../entities/ptc.entity';

export class QueryPtcDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de ficha',
    example: 'uuid-ficha',
  })
  @IsUUID()
  @IsOptional()
  fichaId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de aprendiz',
    example: 'uuid-aprendiz',
  })
  @IsUUID()
  @IsOptional()
  aprendizId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: PtcEstado,
    example: PtcEstado.VIGENTE,
  })
  @IsEnum(PtcEstado)
  @IsOptional()
  estado?: PtcEstado;

  @ApiPropertyOptional({
    description: 'Fecha desde (filtro por fecha de inicio)',
    example: '2026-01-01',
  })
  @IsDateString()
  @IsOptional()
  desde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (filtro por fecha de inicio)',
    example: '2026-12-31',
  })
  @IsDateString()
  @IsOptional()
  hasta?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda por texto en motivo o descripción',
    example: 'académico',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Página actual',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
