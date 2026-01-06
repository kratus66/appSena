import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { ClaseSesion } from './clase-sesion.entity';
import { Aprendiz } from '../../aprendices/entities/aprendiz.entity';

@Entity('asistencias')
@Unique(['sesionId', 'aprendizId']) // No permitir duplicar asistencia para misma sesión + mismo aprendiz
export class Asistencia extends BaseEntity {
  @ApiProperty({
    description: 'ID de la sesión de clase',
    example: 'uuid-sesion',
  })
  @Column({ type: 'uuid', name: 'sesion_id' })
  sesionId: string;

  @ManyToOne(() => ClaseSesion, (sesion) => sesion.asistencias, { eager: false })
  @JoinColumn({ name: 'sesion_id' })
  sesion: ClaseSesion;

  @ApiProperty({
    description: 'ID del aprendiz',
    example: 'uuid-aprendiz',
  })
  @Column({ type: 'uuid', name: 'aprendiz_id' })
  aprendizId: string;

  @ManyToOne(() => Aprendiz, { eager: false })
  @JoinColumn({ name: 'aprendiz_id' })
  aprendiz: Aprendiz;

  @ApiProperty({
    example: true,
    description: 'Indica si el aprendiz estuvo presente',
  })
  @Column({ type: 'boolean', default: false })
  presente: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si la ausencia fue justificada',
  })
  @Column({ type: 'boolean', default: false })
  justificada: boolean;

  @ApiProperty({
    example: 'Cita médica',
    description: 'Motivo de justificación de la ausencia (opcional)',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  motivoJustificacion: string;

  @ApiProperty({
    example: 'https://example.com/evidencia.pdf',
    description: 'URL de evidencia de justificación (opcional)',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  evidenciaUrl: string;
}
