import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { CalendarEvent } from './calendar-event.entity';

export enum ReminderChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum ReminderStatus {
  PENDIENTE = 'PENDIENTE',
  ENVIADO = 'ENVIADO',
  CANCELADO = 'CANCELADO',
}

@Entity('reminders')
export class Reminder extends BaseEntity {
  @ApiProperty({
    description: 'ID del evento asociado',
    example: 'uuid-evento',
  })
  @Column({ type: 'uuid', name: 'event_id' })
  eventId: string;

  @ManyToOne(() => CalendarEvent, (event) => event.recordatorios, { eager: false })
  @JoinColumn({ name: 'event_id' })
  event: CalendarEvent;

  @ApiProperty({
    description: 'Fecha y hora en que se debe enviar el recordatorio (UTC)',
    example: '2026-01-15T12:00:00Z',
  })
  @Column({ type: 'timestamp', name: 'remind_at' })
  remindAt: Date;

  @ApiProperty({
    description: 'Canal por el cual se enviará el recordatorio',
    enum: ReminderChannel,
    example: 'IN_APP',
    default: 'IN_APP',
  })
  @Column({
    type: 'enum',
    enum: ReminderChannel,
    default: ReminderChannel.IN_APP,
  })
  canal: ReminderChannel;

  @ApiProperty({
    description: 'Estado del recordatorio',
    enum: ReminderStatus,
    example: 'PENDIENTE',
    default: 'PENDIENTE',
  })
  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.PENDIENTE,
  })
  estado: ReminderStatus;

  @ApiProperty({
    description: 'Mensaje personalizado del recordatorio',
    example: 'Recuerda tu reunión de seguimiento en 2 horas',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  mensaje: string;

  @ApiProperty({
    description: 'Fecha y hora en que se envió el recordatorio',
    example: '2026-01-15T12:00:05Z',
    required: false,
  })
  @Column({ type: 'timestamp', name: 'sent_at', nullable: true })
  sentAt: Date;
}
