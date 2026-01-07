import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventType, EventStatus } from '../entities/calendar-event.entity';

export class QueryEventsDto {
  @ApiProperty({
    description: 'Fecha de inicio del rango (ISO 8601)',
    example: '2026-01-01T00:00:00Z',
  })
  @IsDateString()
  desde: string;

  @ApiProperty({
    description: 'Fecha de fin del rango (ISO 8601)',
    example: '2026-01-31T23:59:59Z',
  })
  @IsDateString()
  hasta: string;

  @ApiProperty({
    description: 'Filtrar por ID de ficha',
    example: 'uuid-ficha',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  fichaId?: string;

  @ApiProperty({
    description: 'Filtrar por ID de aprendiz',
    example: 'uuid-aprendiz',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  aprendizId?: string;

  @ApiProperty({
    description: 'Filtrar por tipo de evento',
    enum: EventType,
    example: 'REUNION',
    required: false,
  })
  @IsEnum(EventType)
  @IsOptional()
  tipo?: EventType;

  @ApiProperty({
    description: 'Filtrar por estado del evento',
    enum: EventStatus,
    example: 'PROGRAMADO',
    required: false,
  })
  @IsEnum(EventStatus)
  @IsOptional()
  estado?: EventStatus;

  @ApiProperty({
    description: 'Búsqueda en título o descripción',
    example: 'reunión',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Número de página',
    example: 1,
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Cantidad de resultados por página',
    example: 10,
    default: 10,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}
