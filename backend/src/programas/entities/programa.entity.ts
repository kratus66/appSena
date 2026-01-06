import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('programas')
export class Programa extends BaseEntity {

  @ApiProperty({
    example: 'Tecnólogo en Análisis y Desarrollo de Software',
    description: 'Nombre del programa de formación',
  })
  @Column({ type: 'varchar', length: 300 })
  nombre: string;

  @ApiProperty({
    example: '228106',
    description: 'Código del programa en el sistema SENA',
  })
  @Column({ type: 'varchar', length: 20, unique: true })
  codigo: string;

  @ApiProperty({
    example: 'TECNOLOGO',
    description: 'Nivel de formación',
    enum: ['TECNICO', 'TECNOLOGO', 'ESPECIALIZACION', 'OPERARIO', 'AUXILIAR'],
  })
  @Column({
    type: 'enum',
    enum: ['TECNICO', 'TECNOLOGO', 'ESPECIALIZACION', 'OPERARIO', 'AUXILIAR'],
  })
  nivelFormacion: string;

  @ApiProperty({
    example: 'Software y TIC',
    description: 'Área de conocimiento del programa',
  })
  @Column({ type: 'varchar', length: 200 })
  areaConocimiento: string;

  @ApiProperty({
    example: 24,
    description: 'Duración en meses del programa',
  })
  @Column({ type: 'int' })
  duracionMeses: number;

  @ApiProperty({
    example: 2640,
    description: 'Total de horas del programa',
  })
  @Column({ type: 'int' })
  totalHoras: number;

  @ApiProperty({
    example: 'Descripción completa del programa...',
    description: 'Descripción del programa',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ApiProperty({
    example: 'Bachiller',
    description: 'Requisitos de ingreso',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  requisitos: string;

  @ApiProperty({ example: true, description: 'Si el programa está activo' })
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  // Relación con Fichas
  // @OneToMany(() => Ficha, (ficha) => ficha.programa)
  // fichas: Ficha[];
}
