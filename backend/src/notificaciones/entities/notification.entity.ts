import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  RECORDATORIO = 'RECORDATORIO',
  EVENTO_CREADO = 'EVENTO_CREADO',
  EVENTO_CANCELADO = 'EVENTO_CANCELADO',
  EVENTO_ACTUALIZADO = 'EVENTO_ACTUALIZADO',
  OTRO = 'OTRO',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @ApiProperty({
    description: 'ID del usuario destinatario',
    example: 'uuid-user',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Recordatorio: Reunión en 2 horas',
    maxLength: 120,
  })
  @Column({ type: 'varchar', length: 120 })
  titulo: string;

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'Tienes una reunión de seguimiento programada para las 14:00',
  })
  @Column({ type: 'text' })
  mensaje: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    enum: NotificationType,
    example: 'RECORDATORIO',
  })
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  tipo: NotificationType;

  @ApiProperty({
    description: 'Tipo de entidad relacionada',
    example: 'CalendarEvent',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, name: 'entity_type', nullable: true })
  entityType: string;

  @ApiProperty({
    description: 'ID de la entidad relacionada',
    example: 'uuid-evento',
    required: false,
  })
  @Column({ type: 'uuid', name: 'entity_id', nullable: true })
  entityId: string;

  @ApiProperty({
    description: 'Indica si la notificación fue leída',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  read: boolean;

  @ApiProperty({
    description: 'Fecha y hora en que se leyó la notificación',
    example: '2026-01-15T14:30:00Z',
    required: false,
  })
  @Column({ type: 'timestamp', name: 'read_at', nullable: true })
  readAt: Date;
}
