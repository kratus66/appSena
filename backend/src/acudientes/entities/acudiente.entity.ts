import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Aprendiz } from '../../aprendices/entities/aprendiz.entity';

export enum Parentesco {
  MADRE = 'MADRE',
  PADRE = 'PADRE',
  HERMANO = 'HERMANO',
  TIO = 'TIO',
  ABUELO = 'ABUELO',
  OTRO = 'OTRO',
}

@Entity('acudientes')
export class Acudiente extends BaseEntity {
  @ApiProperty({
    example: 'María Luisa',
    description: 'Nombres del acudiente',
  })
  @Column({ type: 'varchar', length: 100 })
  nombres: string;

  @ApiProperty({
    example: 'González Pérez',
    description: 'Apellidos del acudiente (opcional)',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  apellidos: string;

  @ApiProperty({
    example: '3201234567',
    description: 'Teléfono de contacto del acudiente',
  })
  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @ApiProperty({
    example: 'acudiente@email.com',
    description: 'Email del acudiente (opcional)',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @ApiProperty({
    example: 'MADRE',
    description: 'Parentesco con el aprendiz',
    enum: Parentesco,
  })
  @Column({
    type: 'enum',
    enum: Parentesco,
  })
  parentesco: Parentesco;

  // Relación con Aprendiz
  @ApiProperty({
    description: 'ID del aprendiz asociado',
    example: 'uuid-aprendiz',
  })
  @Column({ type: 'uuid', name: 'aprendiz_id' })
  aprendizId: string;

  @ManyToOne(() => Aprendiz)
  @JoinColumn({ name: 'aprendiz_id' })
  aprendiz: Aprendiz;
}
