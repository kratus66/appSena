import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { EventType, EventStatus, EventPriority } from '../entities/calendar-event.entity';

export class CreateEventDto {
  @ApiProperty({
    description: 'Título del evento',
    example: 'Reunión de seguimiento académico',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titulo: string;

  @ApiProperty({
    description: 'Descripción detallada del evento',
    example: 'Reunión para revisar el rendimiento académico del aprendiz',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de evento',
    enum: EventType,
    example: 'REUNION',
  })
  @IsEnum(EventType)
  @IsNotEmpty()
  tipo: EventType;

  @ApiProperty({
    description: 'Fecha y hora de inicio del evento (ISO 8601)',
    example: '2026-01-15T14:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha y hora de fin del evento (ISO 8601)',
    example: '2026-01-15T15:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @ApiProperty({
    description: 'Indica si el evento dura todo el día',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @ApiProperty({
    description: 'Estado del evento',
    enum: EventStatus,
    example: 'PROGRAMADO',
    default: 'PROGRAMADO',
    required: false,
  })
  @IsEnum(EventStatus)
  @IsOptional()
  estado?: EventStatus;

  @ApiProperty({
    description: 'Prioridad del evento',
    enum: EventPriority,
    example: 'MEDIA',
    default: 'MEDIA',
    required: false,
  })
  @IsEnum(EventPriority)
  @IsOptional()
  prioridad?: EventPriority;

  @ApiProperty({
    description: 'ID de la ficha asociada',
    example: 'uuid-ficha',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  fichaId?: string;

  @ApiProperty({
    description: 'ID del aprendiz asociado',
    example: 'uuid-aprendiz',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  aprendizId?: string;

  @ApiProperty({
    description: 'ID del caso disciplinario asociado',
    example: 'uuid-caso',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  casoDisciplinarioId?: string;

  @ApiProperty({
    description: 'ID del PTC asociado',
    example: 'uuid-ptc',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  ptcId?: string;

  @ApiProperty({
    description: 'ID del acta asociada',
    example: 'uuid-acta',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  actaId?: string;

  @ApiProperty({
    description: 'ID del usuario asignado al evento',
    example: 'uuid-user',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  assignedToId?: string;
}
