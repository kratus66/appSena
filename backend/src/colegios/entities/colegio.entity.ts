import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('colegios')
export class Colegio extends BaseEntity {

  @ApiProperty({ example: 'Institución Educativa San José', description: 'Nombre del colegio' })
  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @ApiProperty({ example: '123456789', description: 'NIT del colegio' })
  @Column({ type: 'varchar', length: 20, unique: true })
  nit: string;

  @ApiProperty({ example: 'Calle 123 #45-67', description: 'Dirección del colegio' })
  @Column({ type: 'varchar', length: 300 })
  direccion: string;

  @ApiProperty({ example: 'Bogotá', description: 'Ciudad del colegio' })
  @Column({ type: 'varchar', length: 100 })
  ciudad: string;

  @ApiProperty({ example: 'Cundinamarca', description: 'Departamento del colegio' })
  @Column({ type: 'varchar', length: 100 })
  departamento: string;

  @ApiProperty({ example: '3001234567', description: 'Teléfono del colegio', required: false })
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @ApiProperty({
    example: 'contacto@colegio.edu.co',
    description: 'Email del colegio',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del rector o coordinador',
    required: false,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  rector: string;

  @ApiProperty({ example: true, description: 'Si el colegio está activo' })
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  // Relación con Fichas
  // @OneToMany(() => Ficha, (ficha) => ficha.colegio)
  // fichas: Ficha[];
}
