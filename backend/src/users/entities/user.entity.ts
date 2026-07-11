import { Entity, Column, BeforeInsert, BeforeUpdate, OneToMany, OneToOne } from 'typeorm';
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

  // ── Perfil de instructor ─────────────────────────────────────────────────
  // Los campos específicos de instructor viven en `perfil_instructor` (1:1)
  // para no arrastrar columnas nulas en el resto de roles. Se carga eager para
  // que los endpoints puedan aplanarlo en la respuesta (ver UsersService.toPublic).
  @OneToOne('PerfilInstructor', 'user', { eager: true, nullable: true })
  perfil?: import('./perfil-instructor.entity').PerfilInstructor;

  // Colegio al que pertenece el usuario (null para roles de plataforma: admin/desarrollador).
  // Determina el alcance de datos que puede ver un COORDINADOR o INSTRUCTOR.
  @Column({ type: 'uuid', name: 'colegio_id', nullable: true })
  colegioId: string | null;

  // Se incrementa en cada logout. El JWT lleva el valor vigente al momento de
  // emitirse; si no coincide con este, el token quedó revocado (ver SEC-7).
  @Column({ type: 'int', name: 'token_version', default: 0 })
  tokenVersion: number;

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
