import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
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

export enum DependenciaFicha {
  ARTICULACION = 'ARTICULACION',
  TITULADA = 'TITULADA',
  COMPLEMENTARIA = 'COMPLEMENTARIA',
}

export enum ModalidadArticulacion {
  COMPARTIDA = 'COMPARTIDA',
  UNICA = 'UNICA',
  COLEGIO_PRIVADO = 'COLEGIO_PRIVADO',
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

  // Relación con Colegio (opcional)
  @ApiProperty({
    description: 'ID del colegio asociado',
    example: 'uuid-colegio',
    required: false,
  })
  @Column({ type: 'uuid', name: 'colegio_id', nullable: true })
  colegioId: string;

  @ManyToOne(() => Colegio, { eager: true, nullable: true })
  @JoinColumn({ name: 'colegio_id' })
  colegio: Colegio;

  // Relación con Programa (opcional)
  @ApiProperty({
    description: 'ID del programa de formación asociado',
    example: 'uuid-programa',
    required: false,
  })
  @Column({ type: 'uuid', name: 'programa_id', nullable: true })
  programaId: string;

  @ManyToOne(() => Programa, { eager: true, nullable: true })
  @JoinColumn({ name: 'programa_id' })
  programa: Programa;

  // Relación con Instructor (opcional)
  @ApiProperty({
    description: 'ID del instructor responsable',
    example: 'uuid-instructor',
    required: false,
  })
  @Column({ type: 'uuid', name: 'instructor_id', nullable: true })
  instructorId: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  // Nuevos campos del módulo de fichas
  @ApiProperty({
    example: 'ARTICULACION',
    description: 'Dependencia operativa de la ficha',
    enum: DependenciaFicha,
    default: DependenciaFicha.TITULADA,
  })
  @Column({
    type: 'enum',
    enum: DependenciaFicha,
    default: DependenciaFicha.TITULADA,
  })
  dependencia: DependenciaFicha;

  @ApiProperty({
    example: 'Formacion titulada',
    description: 'Tipo de programa de formación',
    required: false,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  tipoProgramaFormacion: string;

  @ApiProperty({
    example: 30,
    description: 'Cupo esperado de aprendices',
    default: 30,
  })
  @Column({ type: 'int', default: 30 })
  cupoEsperado: number;

  @ApiProperty({
    example: 'COMPARTIDA',
    description: 'Modalidad de articulación (solo para fichas de articulación)',
    enum: ModalidadArticulacion,
    required: false,
  })
  @Column({
    type: 'enum',
    enum: ModalidadArticulacion,
    nullable: true,
  })
  modalidadArticulacion: ModalidadArticulacion;

  @ApiProperty({
    example: 'Chapinero',
    description: 'Localidad (para fichas de articulación)',
    required: false,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  localidad: string;

  @ApiProperty({
    example: 'Sala 201',
    description: 'Ambiente asignado',
    required: false,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  ambiente: string;

  @ApiProperty({
    example: 'Ficha en proceso de alistamiento',
    description: 'Observaciones adicionales',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // Relación inversa con Aprendices (para count)
  @OneToMany('Aprendiz', 'ficha')
  aprendices: any[];
}
