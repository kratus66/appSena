import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { ReminderChannel } from '../entities/reminder.entity';

export class CreateReminderDto {
  @ApiProperty({
    description: 'Fecha y hora en que se debe enviar el recordatorio (ISO 8601)',
    example: '2026-01-15T12:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  remindAt: string;

  @ApiProperty({
    description: 'Canal por el cual se enviará el recordatorio',
    enum: ReminderChannel,
    example: 'IN_APP',
    default: 'IN_APP',
    required: false,
  })
  @IsEnum(ReminderChannel)
  @IsOptional()
  canal?: ReminderChannel;

  @ApiProperty({
    description: 'Mensaje personalizado del recordatorio',
    example: 'Recuerda tu reunión de seguimiento en 2 horas',
    required: false,
  })
  @IsString()
  @IsOptional()
  mensaje?: string;
}
