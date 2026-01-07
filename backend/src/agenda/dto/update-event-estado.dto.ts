import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EventStatus } from '../entities/calendar-event.entity';

export class UpdateEventEstadoDto {
  @ApiProperty({
    description: 'Nuevo estado del evento',
    enum: EventStatus,
    example: 'COMPLETADO',
  })
  @IsEnum(EventStatus)
  @IsNotEmpty()
  estado: EventStatus;
}
