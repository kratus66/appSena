import { IsOptional, IsUUID, IsEnum, IsDateString, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ActaEstado } from '../entities/acta.entity';

export class QueryActaDto {
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
    description: 'Filtrar por ID de PTC',
    example: 'uuid-ptc',
  })
  @IsUUID()
  @IsOptional()
  ptcId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: ActaEstado,
    example: ActaEstado.FIRMABLE,
  })
  @IsEnum(ActaEstado)
  @IsOptional()
  estado?: ActaEstado;

  @ApiPropertyOptional({
    description: 'Fecha desde (filtro por fecha de reunión)',
    example: '2026-01-01',
  })
  @IsDateString()
  @IsOptional()
  desde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (filtro por fecha de reunión)',
    example: '2026-12-31',
  })
  @IsDateString()
  @IsOptional()
  hasta?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda por texto en asunto o desarrollo',
    example: 'seguimiento',
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
