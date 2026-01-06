import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSesionDto {
  @ApiProperty({
    description: 'ID de la ficha',
    example: 'uuid-ficha',
  })
  @IsNotEmpty({ message: 'El fichaId es obligatorio' })
  @IsUUID('4', { message: 'El fichaId debe ser un UUID válido' })
  fichaId: string;

  @ApiProperty({
    description: 'Fecha de la sesión (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida en formato ISO (YYYY-MM-DD)' })
  fecha: string;

  @ApiProperty({
    description: 'Tema de la sesión',
    example: 'Introducción a TypeORM',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El tema debe ser una cadena de texto' })
  @MaxLength(300, { message: 'El tema no puede exceder los 300 caracteres' })
  tema?: string;

  @ApiProperty({
    description: 'Observaciones de la sesión',
    example: 'Los aprendices mostraron buen desempeño',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;
}
