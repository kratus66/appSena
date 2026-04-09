import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Ambiente } from './ambiente.entity';
import { Ficha } from '../../fichas/entities/ficha.entity';
import { User } from '../../users/entities/user.entity';

export enum DiaSemana {
  LUN = 'LUN',
  MAR = 'MAR',
  MIE = 'MIE',
  JUE = 'JUE',
  VIE = 'VIE',
  SAB = 'SAB',
  DOM = 'DOM',
}

export enum JornadaBloque {
  MANANA = 'MANANA',
  TARDE = 'TARDE',
  NOCHE = 'NOCHE',
}

@Entity('asignaciones_ambiente')
@Unique(['ambienteId', 'dia', 'jornada'])
export class AsignacionAmbiente extends BaseEntity {
  @Column({ name: 'ambiente_id', type: 'uuid' })
  ambienteId: string;

  @ManyToOne(() => Ambiente, (a) => a.asignaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ambiente_id' })
  ambiente: Ambiente;

  @ApiProperty({ description: 'ID de la ficha asignada', required: false })
  @Column({ name: 'ficha_id', type: 'uuid', nullable: true })
  fichaId: string;

  @ManyToOne(() => Ficha, { eager: false, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'ficha_id' })
  ficha: Ficha;

  @ApiProperty({ description: 'ID del instructor', required: false })
  @Column({ name: 'instructor_id', type: 'uuid', nullable: true })
  instructorId: string;

  @ManyToOne(() => User, { eager: false, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  @ApiProperty({ enum: DiaSemana })
  @Column({ type: 'enum', enum: DiaSemana })
  dia: DiaSemana;

  @ApiProperty({ enum: JornadaBloque })
  @Column({ type: 'enum', enum: JornadaBloque })
  jornada: JornadaBloque;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  notas: string;
}
