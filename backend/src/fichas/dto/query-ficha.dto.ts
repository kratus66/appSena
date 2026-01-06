import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JornadaFicha, EstadoFicha } from '../entities/ficha.entity';

export class QueryFichaDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de colegio',
    example: 'uuid-colegio',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El colegioId debe ser un UUID válido' })
  colegioId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de programa',
    example: 'uuid-programa',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El programaId debe ser un UUID válido' })
  programaId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de instructor',
    example: 'uuid-instructor',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El instructorId debe ser un UUID válido' })
  instructorId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de la ficha',
    enum: EstadoFicha,
    example: 'ACTIVA',
  })
  @IsOptional()
  @IsEnum(EstadoFicha)
  estado?: EstadoFicha;

  @ApiPropertyOptional({
    description: 'Filtrar por jornada',
    enum: JornadaFicha,
    example: 'MAÑANA',
  })
  @IsOptional()
  @IsEnum(JornadaFicha)
  jornada?: JornadaFicha;

  @ApiPropertyOptional({
    description: 'Buscar por número de ficha (búsqueda parcial)',
    example: '2654',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Número de página (default: 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página (default: 10)',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
