import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';

export enum TipoAmbiente {
  TITULADA = 'TITULADA',
  COMPLEMENTARIA = 'COMPLEMENTARIA',
}

export enum EstadoAmbiente {
  ACTIVO = 'ACTIVO',
  MANTENIMIENTO = 'MANTENIMIENTO',
  INACTIVO = 'INACTIVO',
}

@Entity('ambientes')
export class Ambiente extends BaseEntity {
  @ApiProperty({ example: 'Sala 4' })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({ example: 'Chapinero' })
  @Column({ type: 'varchar', length: 100 })
  sede: string;

  @ApiProperty({ example: 30 })
  @Column({ type: 'int', default: 30 })
  capacidad: number;

  @ApiProperty({ enum: TipoAmbiente })
  @Column({ type: 'enum', enum: TipoAmbiente })
  tipo: TipoAmbiente;

  @ApiProperty({ enum: EstadoAmbiente })
  @Column({ type: 'enum', enum: EstadoAmbiente, default: EstadoAmbiente.ACTIVO })
  estado: EstadoAmbiente;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ApiProperty({ required: false, example: 'Computadores, Proyector' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  equipamiento: string;

  @OneToMany('AsignacionAmbiente', 'ambiente', { cascade: true })
  asignaciones: any[];
}
