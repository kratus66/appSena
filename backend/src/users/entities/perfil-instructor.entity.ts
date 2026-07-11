import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User, DependenciaInstructor, EstadoDisponibilidad } from './user.entity';

/**
 * Datos de perfil específicos del rol INSTRUCTOR, separados de `users` para
 * no arrastrar ~12 columnas nulas en admin/coordinador/aprendiz/desarrollador.
 * Relación 1:1 con User (un usuario instructor tiene a lo sumo un perfil).
 */
@Entity('perfil_instructor')
export class PerfilInstructor extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.perfil, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 150, nullable: true })
  profesion: string;

  @Column({ type: 'enum', enum: DependenciaInstructor, nullable: true })
  dependencia: DependenciaInstructor;

  @Column({ type: 'varchar', length: 150, nullable: true })
  area: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  tipoPrograma: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  sede: string;

  @Column({ type: 'date', nullable: true })
  fechaInicioContrato: string;

  @Column({ type: 'date', nullable: true })
  fechaFinContrato: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  colegioArticulacion: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modalidadArticulacion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  jornadaArticulacion: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  localidad: string;

  @Column({
    type: 'enum',
    enum: EstadoDisponibilidad,
    nullable: true,
    default: EstadoDisponibilidad.DISPONIBLE,
  })
  estadoDisponibilidad: EstadoDisponibilidad;
}
