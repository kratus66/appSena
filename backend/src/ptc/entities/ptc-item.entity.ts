import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Ptc } from './ptc.entity';
import { User } from '../../users/entities/user.entity';

export enum PtcItemTipo {
  COMPROMISO_APRENDIZ = 'COMPROMISO_APRENDIZ',
  COMPROMISO_INSTRUCTOR = 'COMPROMISO_INSTRUCTOR',
  COMPROMISO_ACUDIENTE = 'COMPROMISO_ACUDIENTE',
  OTRO = 'OTRO',
}

export enum PtcItemEstado {
  PENDIENTE = 'PENDIENTE',
  CUMPLIDO = 'CUMPLIDO',
  INCUMPLIDO = 'INCUMPLIDO',
}

@Entity('ptc_items')
export class PtcItem extends BaseEntity {
  @ApiProperty({
    description: 'ID del PTC al que pertenece',
    example: 'uuid-ptc',
  })
  @Column({ type: 'uuid', name: 'ptc_id' })
  ptcId: string;

  @ManyToOne(() => Ptc, (ptc) => ptc.items, { eager: false })
  @JoinColumn({ name: 'ptc_id' })
  ptc: Ptc;

  @ApiProperty({
    description: 'Tipo de compromiso o acción',
    enum: PtcItemTipo,
    example: PtcItemTipo.COMPROMISO_APRENDIZ,
  })
  @Column({
    type: 'enum',
    enum: PtcItemTipo,
  })
  tipo: PtcItemTipo;

  @ApiProperty({
    description: 'Descripción del compromiso',
    example: 'Asistir a tutorías de refuerzo los martes y jueves',
  })
  @Column({ type: 'text' })
  descripcion: string;

  @ApiProperty({
    description: 'Fecha compromiso de cumplimiento',
    example: '2026-02-15',
  })
  @Column({ type: 'date', name: 'fecha_compromiso' })
  fechaCompromiso: Date;

  @ApiProperty({
    description: 'Nombre del responsable (MVP: texto libre)',
    example: 'María García - Acudiente',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, name: 'responsable_nombre', nullable: true })
  responsableNombre: string;

  @ApiProperty({
    description: 'Estado del cumplimiento',
    enum: PtcItemEstado,
    example: PtcItemEstado.PENDIENTE,
  })
  @Column({
    type: 'enum',
    enum: PtcItemEstado,
    default: PtcItemEstado.PENDIENTE,
  })
  estado: PtcItemEstado;

  @ApiProperty({
    description: 'URL de evidencia del cumplimiento (opcional)',
    example: 'https://bucket.s3.amazonaws.com/evidencia.pdf',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, name: 'evidencia_url', nullable: true })
  evidenciaUrl: string;

  @ApiProperty({
    description: 'Notas adicionales sobre el cumplimiento',
    example: 'Se verificó asistencia mediante firmas',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notas: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}
