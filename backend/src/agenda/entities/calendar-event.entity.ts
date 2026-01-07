import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Ficha } from '../../fichas/entities/ficha.entity';
import { Aprendiz } from '../../aprendices/entities/aprendiz.entity';
import { User } from '../../users/entities/user.entity';
import { DisciplinaryCase } from '../../disciplinario/entities/disciplinary-case.entity';
import { Ptc } from '../../ptc/entities/ptc.entity';
import { Acta } from '../../ptc/entities/acta.entity';
import { Reminder } from './reminder.entity';

export enum EventType {
  CLASE = 'CLASE',
  REUNION = 'REUNION',
  CITACION = 'CITACION',
  COMPROMISO = 'COMPROMISO',
  OTRO = 'OTRO',
}

export enum EventStatus {
  PROGRAMADO = 'PROGRAMADO',
  CANCELADO = 'CANCELADO',
  COMPLETADO = 'COMPLETADO',
}

export enum EventPriority {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

@Entity('calendar_events')
export class CalendarEvent extends BaseEntity {
  @ApiProperty({
    description: 'Título del evento',
    example: 'Reunión de seguimiento académico',
    maxLength: 120,
  })
  @Column({ type: 'varchar', length: 120 })
  titulo: string;

  @ApiProperty({
    description: 'Descripción detallada del evento',
    example: 'Reunión para revisar el rendimiento académico del aprendiz',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ApiProperty({
    description: 'Tipo de evento',
    enum: EventType,
    example: 'REUNION',
  })
  @Column({
    type: 'enum',
    enum: EventType,
  })
  tipo: EventType;

  @ApiProperty({
    description: 'Fecha y hora de inicio del evento (UTC)',
    example: '2026-01-15T14:00:00Z',
  })
  @Column({ type: 'timestamp', name: 'fecha_inicio' })
  fechaInicio: Date;

  @ApiProperty({
    description: 'Fecha y hora de fin del evento (UTC)',
    example: '2026-01-15T15:00:00Z',
    required: false,
  })
  @Column({ type: 'timestamp', name: 'fecha_fin', nullable: true })
  fechaFin: Date;

  @ApiProperty({
    description: 'Indica si el evento dura todo el día',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', name: 'all_day', default: false })
  allDay: boolean;

  @ApiProperty({
    description: 'Estado del evento',
    enum: EventStatus,
    example: 'PROGRAMADO',
    default: 'PROGRAMADO',
  })
  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PROGRAMADO,
  })
  estado: EventStatus;

  @ApiProperty({
    description: 'Prioridad del evento',
    enum: EventPriority,
    example: 'MEDIA',
    default: 'MEDIA',
    required: false,
  })
  @Column({
    type: 'enum',
    enum: EventPriority,
    default: EventPriority.MEDIA,
    nullable: true,
  })
  prioridad: EventPriority;

  // Relaciones opcionales con otras entidades

  @ApiProperty({
    description: 'ID de la ficha asociada (opcional)',
    example: 'uuid-ficha',
    required: false,
  })
  @Column({ type: 'uuid', name: 'ficha_id', nullable: true })
  fichaId: string;

  @ManyToOne(() => Ficha, { eager: false, nullable: true })
  @JoinColumn({ name: 'ficha_id' })
  ficha: Ficha;

  @ApiProperty({
    description: 'ID del aprendiz asociado (opcional)',
    example: 'uuid-aprendiz',
    required: false,
  })
  @Column({ type: 'uuid', name: 'aprendiz_id', nullable: true })
  aprendizId: string;

  @ManyToOne(() => Aprendiz, { eager: false, nullable: true })
  @JoinColumn({ name: 'aprendiz_id' })
  aprendiz: Aprendiz;

  @ApiProperty({
    description: 'ID del caso disciplinario asociado (opcional)',
    example: 'uuid-caso',
    required: false,
  })
  @Column({ type: 'uuid', name: 'caso_disciplinario_id', nullable: true })
  casoDisciplinarioId: string;

  @ManyToOne(() => DisciplinaryCase, { eager: false, nullable: true })
  @JoinColumn({ name: 'caso_disciplinario_id' })
  casoDisciplinario: DisciplinaryCase;

  @ApiProperty({
    description: 'ID del PTC asociado (opcional)',
    example: 'uuid-ptc',
    required: false,
  })
  @Column({ type: 'uuid', name: 'ptc_id', nullable: true })
  ptcId: string;

  @ManyToOne(() => Ptc, { eager: false, nullable: true })
  @JoinColumn({ name: 'ptc_id' })
  ptc: Ptc;

  @ApiProperty({
    description: 'ID del acta asociada (opcional)',
    example: 'uuid-acta',
    required: false,
  })
  @Column({ type: 'uuid', name: 'acta_id', nullable: true })
  actaId: string;

  @ManyToOne(() => Acta, { eager: false, nullable: true })
  @JoinColumn({ name: 'acta_id' })
  acta: Acta;

  // Usuario que creó el evento

  @ApiProperty({
    description: 'ID del usuario que creó el evento',
    example: 'uuid-user',
  })
  @Column({ type: 'uuid', name: 'created_by_user_id' })
  createdByUserId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: User;

  // Usuario asignado (opcional)

  @ApiProperty({
    description: 'ID del usuario asignado al evento (opcional)',
    example: 'uuid-user',
    required: false,
  })
  @Column({ type: 'uuid', name: 'assigned_to_id', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  // Recordatorios asociados

  @OneToMany(() => Reminder, (reminder) => reminder.event)
  recordatorios: Reminder[];
}
