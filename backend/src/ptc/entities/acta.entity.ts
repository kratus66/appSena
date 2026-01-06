import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Ficha } from '../../fichas/entities/ficha.entity';
import { Aprendiz } from '../../aprendices/entities/aprendiz.entity';
import { Ptc } from './ptc.entity';
import { DisciplinaryCase } from '../../disciplinario/entities/disciplinary-case.entity';
import { User } from '../../users/entities/user.entity';
import { ActaAsistente } from './acta-asistente.entity';

export enum ActaEstado {
  BORRADOR = 'BORRADOR',
  FIRMABLE = 'FIRMABLE',
  CERRADA = 'CERRADA',
}

@Entity('actas')
export class Acta extends BaseEntity {
  @ApiProperty({
    description: 'ID de la ficha asociada',
    example: 'uuid-ficha',
  })
  @Column({ type: 'uuid', name: 'ficha_id' })
  fichaId: string;

  @ManyToOne(() => Ficha, { eager: false })
  @JoinColumn({ name: 'ficha_id' })
  ficha: Ficha;

  @ApiProperty({
    description: 'ID del aprendiz principal del acta',
    example: 'uuid-aprendiz',
  })
  @Column({ type: 'uuid', name: 'aprendiz_id' })
  aprendizId: string;

  @ManyToOne(() => Aprendiz, { eager: false })
  @JoinColumn({ name: 'aprendiz_id' })
  aprendiz: Aprendiz;

  @ApiProperty({
    description: 'ID del PTC relacionado (opcional)',
    example: 'uuid-ptc',
    required: false,
  })
  @Column({ type: 'uuid', name: 'ptc_id', nullable: true })
  ptcId: string;

  @ManyToOne(() => Ptc, (ptc) => ptc.actas, { eager: false, nullable: true })
  @JoinColumn({ name: 'ptc_id' })
  ptc: Ptc;

  @ApiProperty({
    description: 'ID del caso disciplinario relacionado (opcional)',
    example: 'uuid-caso',
    required: false,
  })
  @Column({ type: 'uuid', name: 'caso_disciplinario_id', nullable: true })
  casoDisciplinarioId: string;

  @ManyToOne(() => DisciplinaryCase, { eager: false, nullable: true })
  @JoinColumn({ name: 'caso_disciplinario_id' })
  casoDisciplinario: DisciplinaryCase;

  @ApiProperty({
    description: 'Fecha y hora de la reunión',
    example: '2026-01-15T10:00:00Z',
  })
  @Column({ type: 'timestamp', name: 'fecha_reunion' })
  fechaReunion: Date;

  @ApiProperty({
    description: 'Lugar de la reunión',
    example: 'Sala de juntas - Edificio A',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  lugar: string;

  @ApiProperty({
    description: 'Asunto de la reunión',
    example: 'Seguimiento a compromisos del PTC',
  })
  @Column({ type: 'varchar', length: 500 })
  asunto: string;

  @ApiProperty({
    description: 'Desarrollo de la reunión - Temas tratados',
    example: 'Se revisó el cumplimiento de compromisos...',
  })
  @Column({ type: 'text' })
  desarrollo: string;

  @ApiProperty({
    description: 'Acuerdos y compromisos resultantes',
    example: 'Se acuerda próxima reunión para el 20 de febrero...',
  })
  @Column({ type: 'text' })
  acuerdos: string;

  @ApiProperty({
    description: 'Estado del acta',
    enum: ActaEstado,
    example: ActaEstado.FIRMABLE,
  })
  @Column({
    type: 'enum',
    enum: ActaEstado,
    default: ActaEstado.BORRADOR,
  })
  estado: ActaEstado;

  @ApiProperty({
    description: 'Resumen al cierre del acta',
    example: 'Acta cerrada con todos los compromisos registrados',
    required: false,
  })
  @Column({ type: 'text', name: 'cierre_resumen', nullable: true })
  cierreResumen: string;

  @ApiProperty({
    description: 'URL del PDF generado (futuro)',
    example: 'https://bucket.s3.amazonaws.com/acta.pdf',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, name: 'pdf_url', nullable: true })
  pdfUrl: string;

  @ApiProperty({
    description: 'Hash del documento para integridad (futuro)',
    example: 'sha256:abc123...',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  hash: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @OneToMany(() => ActaAsistente, (asistente) => asistente.acta, { cascade: true })
  asistentes: ActaAsistente[];
}
