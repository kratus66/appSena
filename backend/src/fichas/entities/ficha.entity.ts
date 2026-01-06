import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Colegio } from '../../colegios/entities/colegio.entity';
import { Programa } from '../../programas/entities/programa.entity';
import { User } from '../../users/entities/user.entity';

export enum JornadaFicha {
  MAÑANA = 'MAÑANA',
  TARDE = 'TARDE',
  NOCHE = 'NOCHE',
  MIXTA = 'MIXTA',
}

export enum EstadoFicha {
  ACTIVA = 'ACTIVA',
  EN_CIERRE = 'EN_CIERRE',
  FINALIZADA = 'FINALIZADA',
}

@Entity('fichas')
export class Ficha extends BaseEntity {
  @ApiProperty({
    example: '2654321',
    description: 'Número único de la ficha',
  })
  @Column({ type: 'varchar', length: 30, unique: true })
  numeroFicha: string;

  @ApiProperty({
    example: 'MAÑANA',
    description: 'Jornada de la ficha',
    enum: JornadaFicha,
  })
  @Column({
    type: 'enum',
    enum: JornadaFicha,
  })
  jornada: JornadaFicha;

  @ApiProperty({
    example: 'ACTIVA',
    description: 'Estado actual de la ficha',
    enum: EstadoFicha,
  })
  @Column({
    type: 'enum',
    enum: EstadoFicha,
    default: EstadoFicha.ACTIVA,
  })
  estado: EstadoFicha;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Fecha de inicio de la ficha',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  fechaInicio: Date;

  @ApiProperty({
    example: '2026-01-15',
    description: 'Fecha de finalización estimada de la ficha',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  fechaFin: Date;

  // Relación con Colegio
  @ApiProperty({
    description: 'ID del colegio asociado',
    example: 'uuid-colegio',
  })
  @Column({ type: 'uuid', name: 'colegio_id' })
  colegioId: string;

  @ManyToOne(() => Colegio, { eager: true })
  @JoinColumn({ name: 'colegio_id' })
  colegio: Colegio;

  // Relación con Programa
  @ApiProperty({
    description: 'ID del programa de formación asociado',
    example: 'uuid-programa',
  })
  @Column({ type: 'uuid', name: 'programa_id' })
  programaId: string;

  @ManyToOne(() => Programa, { eager: true })
  @JoinColumn({ name: 'programa_id' })
  programa: Programa;

  // Relación con Instructor
  @ApiProperty({
    description: 'ID del instructor responsable',
    example: 'uuid-instructor',
  })
  @Column({ type: 'uuid', name: 'instructor_id' })
  instructorId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;
}
