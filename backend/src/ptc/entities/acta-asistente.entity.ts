import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Acta } from './acta.entity';

export enum ActaAsistenteRol {
  APRENDIZ = 'APRENDIZ',
  INSTRUCTOR = 'INSTRUCTOR',
  COORDINADOR = 'COORDINADOR',
  ACUDIENTE = 'ACUDIENTE',
  OTRO = 'OTRO',
}

@Entity('acta_asistentes')
export class ActaAsistente extends BaseEntity {
  @ApiProperty({
    description: 'ID del acta a la que pertenece',
    example: 'uuid-acta',
  })
  @Column({ type: 'uuid', name: 'acta_id' })
  actaId: string;

  @ManyToOne(() => Acta, (acta) => acta.asistentes, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'acta_id' })
  acta: Acta;

  @ApiProperty({
    description: 'Nombre completo del asistente',
    example: 'María García Pérez',
  })
  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @ApiProperty({
    description: 'Rol del asistente en la reunión',
    enum: ActaAsistenteRol,
    example: ActaAsistenteRol.ACUDIENTE,
  })
  @Column({
    type: 'enum',
    enum: ActaAsistenteRol,
  })
  rol: ActaAsistenteRol;

  @ApiProperty({
    description: 'Email del asistente (opcional)',
    example: 'maria.garcia@email.com',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @ApiProperty({
    description: 'Teléfono del asistente (opcional)',
    example: '3001234567',
    required: false,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;
}
