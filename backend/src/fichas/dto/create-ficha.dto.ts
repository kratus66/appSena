import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { JornadaFicha, EstadoFicha } from '../entities/ficha.entity';

export class CreateFichaDto {
  @ApiProperty({
    example: '2654321',
    description: 'Número único de la ficha',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de ficha es requerido' })
  @MinLength(3, { message: 'El número de ficha debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'El número de ficha no puede tener más de 30 caracteres' })
  numeroFicha: string;

  @ApiProperty({
    example: 'MAÑANA',
    description: 'Jornada de la ficha',
    enum: JornadaFicha,
  })
  @IsEnum(JornadaFicha, { message: 'La jornada debe ser MAÑANA, TARDE, NOCHE o MIXTA' })
  @IsNotEmpty({ message: 'La jornada es requerida' })
  jornada: JornadaFicha;

  @ApiProperty({
    example: 'ACTIVA',
    description: 'Estado inicial de la ficha (por defecto ACTIVA)',
    enum: EstadoFicha,
    required: false,
    default: EstadoFicha.ACTIVA,
  })
  @IsEnum(EstadoFicha, { message: 'El estado debe ser ACTIVA, EN_CIERRE o FINALIZADA' })
  @IsOptional()
  estado?: EstadoFicha;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Fecha de inicio de la ficha (formato ISO)',
    required: false,
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  @IsOptional()
  fechaInicio?: string;

  @ApiProperty({
    example: '2026-01-15',
    description: 'Fecha de finalización estimada (formato ISO)',
    required: false,
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  @IsOptional()
  fechaFin?: string;

  @ApiProperty({
    example: 'uuid-colegio',
    description: 'ID del colegio asociado a la ficha',
  })
  @IsUUID('4', { message: 'El colegioId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El colegioId es requerido' })
  colegioId: string;

  @ApiProperty({
    example: 'uuid-programa',
    description: 'ID del programa de formación asociado',
  })
  @IsUUID('4', { message: 'El programaId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El programaId es requerido' })
  programaId: string;

  @ApiProperty({
    example: 'uuid-instructor',
    description: 'ID del instructor responsable de la ficha',
  })
  @IsUUID('4', { message: 'El instructorId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El instructorId es requerido' })
  instructorId: string;
}
