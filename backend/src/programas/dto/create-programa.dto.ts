import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateProgramaDto {
  @ApiProperty({
    example: 'Tecnólogo en Análisis y Desarrollo de Software',
    description: 'Nombre del programa de formación',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del programa es requerido' })
  @MaxLength(300, { message: 'El nombre no puede tener más de 300 caracteres' })
  nombre: string;

  @ApiProperty({
    example: '228106',
    description: 'Código del programa en el sistema SENA',
  })
  @IsString()
  @IsNotEmpty({ message: 'El código del programa es requerido' })
  @MaxLength(20, { message: 'El código no puede tener más de 20 caracteres' })
  codigo: string;

  @ApiProperty({
    example: 'TECNOLOGO',
    description: 'Nivel de formación',
    enum: ['TECNICO', 'TECNOLOGO', 'ESPECIALIZACION', 'OPERARIO', 'AUXILIAR'],
  })
  @IsEnum(['TECNICO', 'TECNOLOGO', 'ESPECIALIZACION', 'OPERARIO', 'AUXILIAR'], {
    message: 'El nivel de formación debe ser: TECNICO, TECNOLOGO, ESPECIALIZACION, OPERARIO o AUXILIAR',
  })
  @IsNotEmpty({ message: 'El nivel de formación es requerido' })
  nivelFormacion: string;

  @ApiProperty({
    example: 'Software y TIC',
    description: 'Área de conocimiento del programa',
  })
  @IsString()
  @IsNotEmpty({ message: 'El área de conocimiento es requerida' })
  @MaxLength(200, { message: 'El área no puede tener más de 200 caracteres' })
  areaConocimiento: string;

  @ApiProperty({
    example: 24,
    description: 'Duración en meses del programa',
  })
  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(1, { message: 'La duración debe ser al menos 1 mes' })
  @Max(60, { message: 'La duración no puede exceder 60 meses' })
  duracionMeses: number;

  @ApiProperty({
    example: 2640,
    description: 'Total de horas del programa',
  })
  @IsInt({ message: 'El total de horas debe ser un número entero' })
  @Min(40, { message: 'El total de horas debe ser al menos 40' })
  @Max(10000, { message: 'El total de horas no puede exceder 10000' })
  totalHoras: number;

  @ApiProperty({
    example: 'Descripción completa del programa...',
    description: 'Descripción del programa',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    example: 'Bachiller',
    description: 'Requisitos de ingreso',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Los requisitos no pueden tener más de 500 caracteres' })
  requisitos?: string;
}
