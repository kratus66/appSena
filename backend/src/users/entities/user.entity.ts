import { Entity, Column, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  COORDINADOR = 'coordinador',
  APRENDIZ = 'aprendiz',
  DESARROLLADOR = 'desarrollador',
}

export enum DependenciaInstructor {
  ARTICULACION = 'Articulacion',
  TITULADA = 'Titulada',
  COMPLEMENTARIA = 'Complementaria',
}

export enum EstadoDisponibilidad {
  DISPONIBLE = 'Disponible',
  PARCIAL = 'Parcial',
  SATURADO = 'Saturado',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  documento: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.INSTRUCTOR,
  })
  rol: UserRole;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fotoPerfil: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  // ── Campos de perfil de instructor ───────────────────────────────────────
  @Column({ type: 'varchar', length: 150, nullable: true })
  profesion: string;

  @Column({
    type: 'enum',
    enum: DependenciaInstructor,
    nullable: true,
  })
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

  // Relación inversa con Fichas (para conteo de carga)
  @OneToMany('Ficha', 'instructor')
  fichas: any[];

  @BeforeInsert()
  async hashPasswordOnInsert() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    // Solo hashear si el password cambió y no está ya hasheado
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
