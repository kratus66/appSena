import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum AccionHistorial {
  CREADA = 'CREADA',
  EDITADA = 'EDITADA',
  REASIGNADA = 'REASIGNADA',
  CERRADA = 'CERRADA',
}

@Entity('planeacion_historial')
export class PlaneacionHistorial extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  planeacionId: string;

  @Column({ type: 'enum', enum: AccionHistorial })
  accion: AccionHistorial;

  @Column({ type: 'varchar', length: 50 })
  dependencia: string;

  @Column({ type: 'varchar', length: 30 })
  fichaNumero: string;

  @Column({ type: 'varchar', length: 100 })
  instructorNombre: string;

  @Column({ type: 'text', nullable: true })
  resumen: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  actor: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ocurrioEn: string;
}
