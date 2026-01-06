import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Parentesco } from '../entities/acudiente.entity';

export class CreateAcudienteDto {
  @ApiProperty({
    example: 'María Luisa',
    description: 'Nombres del acudiente',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  @MinLength(2, { message: 'Los nombres deben tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'Los nombres no pueden tener más de 100 caracteres' })
  nombres: string;

  @ApiProperty({
    example: 'González Pérez',
    description: 'Apellidos del acudiente (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'Los apellidos no pueden tener más de 100 caracteres' })
  apellidos?: string;

  @ApiProperty({
    example: '3201234567',
    description: 'Teléfono de contacto del acudiente',
  })
  @IsString()
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @MinLength(7, { message: 'El teléfono debe tener al menos 7 caracteres' })
  @MaxLength(20, { message: 'El teléfono no puede tener más de 20 caracteres' })
  telefono: string;

  @ApiProperty({
    example: 'acudiente@email.com',
    description: 'Email del acudiente (opcional)',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @MaxLength(100, { message: 'El email no puede tener más de 100 caracteres' })
  email?: string;

  @ApiProperty({
    example: 'MADRE',
    description: 'Parentesco con el aprendiz',
    enum: Parentesco,
  })
  @IsEnum(Parentesco, { message: 'El parentesco debe ser MADRE, PADRE, HERMANO, TIO, ABUELO u OTRO' })
  @IsNotEmpty({ message: 'El parentesco es requerido' })
  parentesco: Parentesco;
}
