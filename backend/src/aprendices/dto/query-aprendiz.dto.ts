import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoAcademico } from '../entities/aprendiz.entity';

export class QueryAprendizDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de ficha',
    example: 'uuid-ficha',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El fichaId debe ser un UUID válido' })
  fichaId?: string;

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
    description: 'Filtrar por estado académico',
    enum: EstadoAcademico,
    example: 'ACTIVO',
  })
  @IsOptional()
  @IsEnum(EstadoAcademico)
  estadoAcademico?: EstadoAcademico;

  @ApiPropertyOptional({
    description: 'Buscar por nombres, apellidos o documento (búsqueda parcial)',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  limit?: number = 10;
}
