import { Entity, Column, ManyToOne, JoinColumn, Unique, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Ficha } from '../../fichas/entities/ficha.entity';
import { User } from '../../users/entities/user.entity';
import { Asistencia } from './asistencia.entity';

@Entity('clase_sesiones')
@Unique(['fichaId', 'fecha']) // No permitir duplicar sesión para misma ficha + misma fecha
export class ClaseSesion extends BaseEntity {
  @ApiProperty({
    description: 'ID de la ficha asociada a la sesión',
    example: 'uuid-ficha',
  })
  @Column({ type: 'uuid', name: 'ficha_id' })
  fichaId: string;

  @ManyToOne(() => Ficha, { eager: false })
  @JoinColumn({ name: 'ficha_id' })
  ficha: Ficha;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Fecha de la sesión de clase',
  })
  @Column({ type: 'date' })
  fecha: Date;

  @ApiProperty({
    example: 'Introducción a TypeORM',
    description: 'Tema de la sesión (opcional)',
    required: false,
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  tema: string;

  @ApiProperty({
    example: 'Los aprendices mostraron buen desempeño',
    description: 'Observaciones de la sesión (opcional)',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // Relación con User (quien creó la sesión)
  @ApiProperty({
    description: 'ID del usuario que creó la sesión',
    example: 'uuid-user',
    required: false,
  })
  @Column({ type: 'uuid', name: 'created_by_user_id', nullable: true })
  createdByUserId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: User;

  // Relación con Asistencias
  @OneToMany(() => Asistencia, (asistencia) => asistencia.sesion)
  asistencias: Asistencia[];
}
