import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { JornadaFicha, EstadoFicha, DependenciaFicha, ModalidadArticulacion } from '../entities/ficha.entity';

export class CreateFichaDto {
  @ApiProperty({ example: '2654321', description: 'Número único de la ficha', minLength: 3, maxLength: 30 })
  @IsString()
  @IsNotEmpty({ message: 'El número de ficha es requerido' })
  @MinLength(3)
  @MaxLength(30)
  numeroFicha: string;

  @ApiProperty({ example: 'MAÑANA', description: 'Jornada de la ficha', enum: JornadaFicha })
  @IsEnum(JornadaFicha, { message: 'La jornada debe ser MAÑANA, TARDE, NOCHE o MIXTA' })
  @IsNotEmpty({ message: 'La jornada es requerida' })
  jornada: JornadaFicha;

  @ApiProperty({ example: 'TITULADA', description: 'Dependencia operativa', enum: DependenciaFicha, required: false })
  @IsEnum(DependenciaFicha)
  @IsOptional()
  dependencia?: DependenciaFicha;

  @ApiProperty({ example: 'Formacion titulada', description: 'Tipo de programa de formación', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  tipoProgramaFormacion?: string;

  @ApiProperty({ example: 30, description: 'Cupo esperado de aprendices', required: false })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  cupoEsperado?: number;

  @ApiProperty({ example: 'COMPARTIDA', description: 'Modalidad de articulación', enum: ModalidadArticulacion, required: false })
  @IsEnum(ModalidadArticulacion)
  @IsOptional()
  modalidadArticulacion?: ModalidadArticulacion;

  @ApiProperty({ example: 'Chapinero', description: 'Localidad', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  localidad?: string;

  @ApiProperty({ example: 'Sala 201', description: 'Ambiente asignado', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  ambiente?: string;

  @ApiProperty({ example: 'Observaciones...', description: 'Observaciones adicionales', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({ example: 'ACTIVA', description: 'Estado inicial', enum: EstadoFicha, required: false })
  @IsEnum(EstadoFicha)
  @IsOptional()
  estado?: EstadoFicha;

  @ApiProperty({ example: '2024-01-15', description: 'Fecha de inicio', required: false })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiProperty({ example: '2026-01-15', description: 'Fecha de fin', required: false })
  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @ApiProperty({ example: 'uuid-colegio', description: 'ID del colegio', required: false })
  @IsUUID('4')
  @IsOptional()
  colegioId?: string;

  @ApiProperty({ example: 'uuid-programa', description: 'ID del programa', required: false })
  @IsUUID('4')
  @IsOptional()
  programaId?: string;

  @ApiProperty({ example: 'uuid-instructor', description: 'ID del instructor', required: false })
  @IsUUID('4')
  @IsOptional()
  instructorId?: string;
}
