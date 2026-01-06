import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { DisciplinaryCase } from './disciplinary-case.entity';
import { User } from '../../users/entities/user.entity';

export enum ActionTipo {
  LLAMADO_ATENCION = 'LLAMADO_ATENCION',
  COMPROMISO = 'COMPROMISO',
  CITACION = 'CITACION',
  OBSERVACION = 'OBSERVACION',
  CIERRE = 'CIERRE',
}

@Entity('case_actions')
export class CaseAction extends BaseEntity {
  @ApiProperty({
    description: 'ID del caso disciplinario asociado',
    example: 'uuid-case',
  })
  @Column({ type: 'uuid', name: 'case_id' })
  caseId: string;

  @ManyToOne(() => DisciplinaryCase, (disciplinaryCase) => disciplinaryCase.acciones, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'case_id' })
  case: DisciplinaryCase;

  @ApiProperty({
    description: 'Tipo de acción o seguimiento',
    enum: ActionTipo,
    example: 'COMPROMISO',
  })
  @Column({
    type: 'enum',
    enum: ActionTipo,
  })
  tipo: ActionTipo;

  @ApiProperty({
    description: 'Descripción detallada de la acción',
    example: 'Se estableció compromiso de mejora en comportamiento con seguimiento quincenal',
  })
  @Column({ type: 'text' })
  descripcion: string;

  @ApiProperty({
    description: 'URL de evidencia de la acción (opcional)',
    example: 'https://storage.example.com/compromiso-firmado.pdf',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'evidencia_url' })
  evidenciaUrl: string;

  @ApiProperty({
    description: 'Fecha de compromiso (solo para tipo COMPROMISO)',
    example: '2024-02-15',
    required: false,
  })
  @Column({ type: 'date', nullable: true, name: 'fecha_compromiso' })
  fechaCompromiso: Date;

  @ApiProperty({
    description: 'Responsable del compromiso (nombre o descripción)',
    example: 'Aprendiz Juan Pérez',
    required: false,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  responsable: string;

  // createdById heredado de BaseEntity representa quién creó la acción
}
