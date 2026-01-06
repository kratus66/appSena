import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Ficha } from '../../fichas/entities/ficha.entity';
import { Aprendiz } from '../../aprendices/entities/aprendiz.entity';
import { User } from '../../users/entities/user.entity';
import { DisciplinaryCase } from '../../disciplinario/entities/disciplinary-case.entity';
import { PtcItem } from './ptc-item.entity';
import { Acta } from './acta.entity';

export enum PtcEstado {
  BORRADOR = 'BORRADOR',
  VIGENTE = 'VIGENTE',
  CERRADO = 'CERRADO',
}

@Entity('ptc')
export class Ptc extends BaseEntity {
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
    description: 'ID del aprendiz',
    example: 'uuid-aprendiz',
  })
  @Column({ type: 'uuid', name: 'aprendiz_id' })
  aprendizId: string;

  @ManyToOne(() => Aprendiz, { eager: false })
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
    description: 'Motivo o título del PTC',
    example: 'Plan de trabajo por bajo rendimiento académico',
  })
  @Column({ type: 'varchar', length: 255 })
  motivo: string;

  @ApiProperty({
    description: 'Descripción detallada del contexto',
    example: 'El aprendiz presenta dificultades en las competencias técnicas...',
  })
  @Column({ type: 'text' })
  descripcion: string;

  @ApiProperty({
    description: 'Fecha de inicio del plan',
    example: '2026-01-10',
  })
  @Column({ type: 'date', name: 'fecha_inicio' })
  fechaInicio: Date;

  @ApiProperty({
    description: 'Fecha estimada de finalización (opcional)',
    example: '2026-03-10',
    required: false,
  })
  @Column({ type: 'date', name: 'fecha_fin', nullable: true })
  fechaFin: Date;

  @ApiProperty({
    description: 'Estado del PTC',
    enum: PtcEstado,
    example: PtcEstado.VIGENTE,
  })
  @Column({
    type: 'enum',
    enum: PtcEstado,
    default: PtcEstado.BORRADOR,
  })
  estado: PtcEstado;

  @ApiProperty({
    description: 'Resumen al momento del cierre (obligatorio al cerrar)',
    example: 'El aprendiz cumplió con el 80% de los compromisos...',
    required: false,
  })
  @Column({ type: 'text', name: 'cierre_resumen', nullable: true })
  cierreResumen: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @OneToMany(() => PtcItem, (item) => item.ptc)
  items: PtcItem[];

  @OneToMany(() => Acta, (acta) => acta.ptc)
  actas: Acta[];
}
