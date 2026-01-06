import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Ficha } from '../../fichas/entities/ficha.entity';

export enum TipoDocumento {
  CC = 'CC',
  TI = 'TI',
  CE = 'CE',
  PAS = 'PAS',
}

export enum EstadoAcademico {
  ACTIVO = 'ACTIVO',
  DESERTOR = 'DESERTOR',
  RETIRADO = 'RETIRADO',
  SUSPENDIDO = 'SUSPENDIDO',
}

@Entity('aprendices')
export class Aprendiz extends BaseEntity {
  @ApiProperty({
    example: 'Juan Carlos',
    description: 'Nombres del aprendiz',
  })
  @Column({ type: 'varchar', length: 100 })
  nombres: string;

  @ApiProperty({
    example: 'Pérez González',
    description: 'Apellidos del aprendiz',
  })
  @Column({ type: 'varchar', length: 100 })
  apellidos: string;

  @ApiProperty({
    example: 'CC',
    description: 'Tipo de documento del aprendiz',
    enum: TipoDocumento,
  })
  @Column({
    type: 'enum',
    enum: TipoDocumento,
  })
  tipoDocumento: TipoDocumento;

  @ApiProperty({
    example: '1234567890',
    description: 'Número de documento único del aprendiz',
  })
  @Column({ type: 'varchar', length: 20, unique: true })
  documento: string;

  @ApiProperty({
    example: 'aprendiz@email.com',
    description: 'Email del aprendiz (opcional)',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email: string;

  @ApiProperty({
    example: '3001234567',
    description: 'Teléfono del aprendiz (opcional)',
    required: false,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @ApiProperty({
    example: 'Calle 123 # 45-67',
    description: 'Dirección del aprendiz (opcional)',
    required: false,
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  direccion: string;

  @ApiProperty({
    example: 'ACTIVO',
    description: 'Estado académico del aprendiz',
    enum: EstadoAcademico,
  })
  @Column({
    type: 'enum',
    enum: EstadoAcademico,
    default: EstadoAcademico.ACTIVO,
  })
  estadoAcademico: EstadoAcademico;

  // Relación con User (para login)
  @ApiProperty({
    description: 'ID del usuario asociado al aprendiz',
    example: 'uuid-user',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relación con Ficha
  @ApiProperty({
    description: 'ID de la ficha a la que pertenece el aprendiz',
    example: 'uuid-ficha',
  })
  @Column({ type: 'uuid', name: 'ficha_id' })
  fichaId: string;

  @ManyToOne(() => Ficha, { eager: true })
  @JoinColumn({ name: 'ficha_id' })
  ficha: Ficha;
}
