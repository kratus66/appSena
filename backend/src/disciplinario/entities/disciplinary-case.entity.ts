import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Ficha } from '../../fichas/entities/ficha.entity';
import { Aprendiz } from '../../aprendices/entities/aprendiz.entity';
import { User } from '../../users/entities/user.entity';
import { CaseAction } from './case-action.entity';

export enum CaseTipo {
  CONVIVENCIA = 'CONVIVENCIA',
  ACADEMICO = 'ACADEMICO',
  ASISTENCIA = 'ASISTENCIA',
  OTRO = 'OTRO',
}

export enum CaseGravedad {
  LEVE = 'LEVE',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

export enum CaseEstado {
  BORRADOR = 'BORRADOR',
  ABIERTO = 'ABIERTO',
  SEGUIMIENTO = 'SEGUIMIENTO',
  CERRADO = 'CERRADO',
}

@Entity('disciplinary_cases')
export class DisciplinaryCase extends BaseEntity {
  @ApiProperty({
    description: 'ID de la ficha asociada',
    example: 'uuid-ficha',
  })
  @Column({ type: 'uuid', name: 'ficha_id' })
  fichaId: string;

  @ManyToOne(() => Ficha, { eager: false })
  @JoinColumn({ name: 'ficha_id' })
  ficha: Ficha;

  @ApiProperty({
    description: 'ID del aprendiz involucrado',
    example: 'uuid-aprendiz',
  })
  @Column({ type: 'uuid', name: 'aprendiz_id' })
  aprendizId: string;

  @ManyToOne(() => Aprendiz, { eager: false })
  @JoinColumn({ name: 'aprendiz_id' })
  aprendiz: Aprendiz;

  @ApiProperty({
    description: 'Tipo de caso disciplinario',
    enum: CaseTipo,
    example: 'CONVIVENCIA',
  })
  @Column({
    type: 'enum',
    enum: CaseTipo,
  })
  tipo: CaseTipo;

  @ApiProperty({
    description: 'Gravedad del caso',
    enum: CaseGravedad,
    example: 'MEDIA',
  })
  @Column({
    type: 'enum',
    enum: CaseGravedad,
  })
  gravedad: CaseGravedad;

  @ApiProperty({
    description: 'Asunto o título corto del caso',
    example: 'Comportamiento inadecuado en clase',
  })
  @Column({ type: 'varchar', length: 200 })
  asunto: string;

  @ApiProperty({
    description: 'Descripción detallada del incidente',
    example: 'El aprendiz mostró comportamiento disruptivo durante la sesión de formación...',
  })
  @Column({ type: 'text' })
  descripcion: string;

  @ApiProperty({
    description: 'Fecha en que ocurrió el incidente',
    example: '2024-01-15',
  })
  @Column({ type: 'date', name: 'fecha_incidente' })
  fechaIncidente: Date;

  @ApiProperty({
    description: 'Estado actual del caso',
    enum: CaseEstado,
    example: 'ABIERTO',
  })
  @Column({
    type: 'enum',
    enum: CaseEstado,
    default: CaseEstado.BORRADOR,
  })
  estado: CaseEstado;

  @ApiProperty({
    description: 'ID del usuario asignado al caso (opcional)',
    example: 'uuid-coordinador',
    required: false,
  })
  @Column({ type: 'uuid', name: 'assigned_to_id', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @ApiProperty({
    description: 'URL de evidencia del caso (opcional)',
    example: 'https://storage.example.com/evidencia.pdf',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'evidencia_url' })
  evidenciaUrl: string;

  @ApiProperty({
    description: 'Resumen del cierre del caso (requerido al cerrar)',
    example: 'Se aplicó el protocolo de convivencia y el aprendiz aceptó compromisos...',
    required: false,
  })
  @Column({ type: 'text', nullable: true, name: 'cierre_resumen' })
  cierreResumen: string;

  // Relación inversa con acciones
  @OneToMany(() => CaseAction, (action) => action.case, { eager: false })
  acciones: CaseAction[];
}
