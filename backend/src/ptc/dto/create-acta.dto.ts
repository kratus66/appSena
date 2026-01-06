import { Type } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateActaAsistenteDto } from './create-acta-asistente.dto';

export class CreateActaDto {
  @ApiProperty({
    description: 'ID de la ficha',
    example: 'uuid-ficha',
  })
  @IsUUID()
  @IsNotEmpty()
  fichaId: string;

  @ApiProperty({
    description: 'ID del aprendiz principal',
    example: 'uuid-aprendiz',
  })
  @IsUUID()
  @IsNotEmpty()
  aprendizId: string;

  @ApiProperty({
    description: 'ID del PTC relacionado (opcional)',
    example: 'uuid-ptc',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  ptcId?: string;

  @ApiProperty({
    description: 'ID del caso disciplinario relacionado (opcional)',
    example: 'uuid-caso',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  casoDisciplinarioId?: string;

  @ApiProperty({
    description: 'Fecha y hora de la reunión',
    example: '2026-01-15T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaReunion: string;

  @ApiProperty({
    description: 'Lugar de la reunión',
    example: 'Sala de juntas - Edificio A',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  lugar?: string;

  @ApiProperty({
    description: 'Asunto de la reunión',
    example: 'Seguimiento a compromisos del PTC',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  asunto: string;

  @ApiProperty({
    description: 'Desarrollo de la reunión',
    example: 'Se revisaron los compromisos establecidos...',
  })
  @IsString()
  @IsNotEmpty()
  desarrollo: string;

  @ApiProperty({
    description: 'Acuerdos resultantes',
    example: 'Se acuerda próxima reunión para el 20 de febrero...',
  })
  @IsString()
  @IsNotEmpty()
  acuerdos: string;

  @ApiProperty({
    description: 'Lista de asistentes a la reunión',
    type: [CreateActaAsistenteDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateActaAsistenteDto)
  asistentes: CreateActaAsistenteDto[];
}
