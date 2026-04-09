import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum DependenciaPlaneacion {
  ARTICULACION = 'ARTICULACION',
  TITULADA = 'TITULADA',
  COMPLEMENTARIA = 'COMPLEMENTARIA',
}

export enum EstadoPlaneacion {
  ACTIVA = 'ACTIVA',
  REASIGNADA = 'REASIGNADA',
  PARCIAL = 'PARCIAL',
  PENDIENTE = 'PENDIENTE',
  CERRADA = 'CERRADA',
}

export enum ModalidadPlaneacion {
  COMPARTIDA = 'COMPARTIDA',
  UNICA = 'UNICA',
  COLEGIO_PRIVADO = 'COLEGIO_PRIVADO',
}

@Entity('planeaciones')
export class Planeacion extends BaseEntity {
  @Column({ type: 'enum', enum: DependenciaPlaneacion })
  dependencia: DependenciaPlaneacion;

  @Column({ type: 'uuid', nullable: true })
  fichaId: string;

  @Column({ type: 'uuid', nullable: true })
  instructorId: string;

  @Column({ type: 'uuid', nullable: true })
  ambienteId: string;

  @Column({ type: 'varchar', length: 30 })
  fichaNumero: string;

  @Column({ type: 'varchar', length: 200 })
  programa: string;

  @Column({ type: 'varchar', length: 100 })
  instructorNombre: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  instructorArea: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ambienteNombre: string;

  @Column({ type: 'simple-array', nullable: true })
  bloques: string[];

  @Column({ type: 'int', default: 0 })
  horasAsignadas: number;

  @Column({
    type: 'enum',
    enum: EstadoPlaneacion,
    default: EstadoPlaneacion.ACTIVA,
  })
  estado: EstadoPlaneacion;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  siteContext: string;

  // Articulación fields
  @Column({ type: 'varchar', length: 100, nullable: true })
  schoolId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  schoolName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  localidad: string;

  @Column({ type: 'enum', enum: ModalidadPlaneacion, nullable: true })
  modalidad: ModalidadPlaneacion;

  @Column({ type: 'varchar', length: 20, nullable: true })
  jornada: string;

  @Column({ type: 'date', nullable: true })
  fechaInicio: string;

  @Column({ type: 'date', nullable: true })
  fechaFin: string;
}
