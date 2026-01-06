import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateColegioDto {
  @ApiProperty({
    example: 'Institución Educativa San José',
    description: 'Nombre del colegio',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del colegio es requerido' })
  @MaxLength(200, { message: 'El nombre no puede tener más de 200 caracteres' })
  nombre: string;

  @ApiProperty({ example: '123456789', description: 'NIT del colegio' })
  @IsString()
  @IsNotEmpty({ message: 'El NIT es requerido' })
  @MaxLength(20, { message: 'El NIT no puede tener más de 20 caracteres' })
  nit: string;

  @ApiProperty({ example: 'Calle 123 #45-67', description: 'Dirección del colegio' })
  @IsString()
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @MaxLength(300, { message: 'La dirección no puede tener más de 300 caracteres' })
  direccion: string;

  @ApiProperty({ example: 'Bogotá', description: 'Ciudad del colegio' })
  @IsString()
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @MaxLength(100, { message: 'La ciudad no puede tener más de 100 caracteres' })
  ciudad: string;

  @ApiProperty({ example: 'Cundinamarca', description: 'Departamento del colegio' })
  @IsString()
  @IsNotEmpty({ message: 'El departamento es requerido' })
  @MaxLength(100, { message: 'El departamento no puede tener más de 100 caracteres' })
  departamento: string;

  @ApiProperty({
    example: '3001234567',
    description: 'Teléfono del colegio',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'El teléfono no puede tener más de 20 caracteres' })
  telefono?: string;

  @ApiProperty({
    example: 'contacto@colegio.edu.co',
    description: 'Email del colegio',
    required: false,
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsOptional()
  @MaxLength(100, { message: 'El email no puede tener más de 100 caracteres' })
  email?: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del rector o coordinador',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'El nombre del rector no puede tener más de 200 caracteres' })
  rector?: string;
}
