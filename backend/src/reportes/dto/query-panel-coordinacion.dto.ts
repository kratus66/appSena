import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueryRangoFechasDto } from './query-rango-fechas.dto';
import { EstadoFicha } from '../../fichas/entities/ficha.entity';

export class QueryPanelCoordinacionDto extends QueryRangoFechasDto {
  @ApiPropertyOptional({
    description: 'ID del colegio para filtrar',
    example: 'uuid-colegio',
  })
  @IsOptional()
  @IsString()
  colegioId?: string;

  @ApiPropertyOptional({
    description: 'ID del programa para filtrar',
    example: 'uuid-programa',
  })
  @IsOptional()
  @IsString()
  programaId?: string;

  @ApiPropertyOptional({
    description: 'Estado de la ficha para filtrar',
    enum: EstadoFicha,
    example: EstadoFicha.ACTIVA,
  })
  @IsOptional()
  @IsEnum(EstadoFicha)
  estadoFicha?: EstadoFicha;
}
