import { IsString, IsEnum, IsOptional, IsEmail, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActaAsistenteRol } from '../entities/acta-asistente.entity';

export class CreateActaAsistenteDto {
  @ApiProperty({
    description: 'Nombre completo del asistente',
    example: 'María García Pérez',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @ApiProperty({
    description: 'Rol del asistente',
    enum: ActaAsistenteRol,
    example: ActaAsistenteRol.ACUDIENTE,
  })
  @IsEnum(ActaAsistenteRol)
  @IsNotEmpty()
  rol: ActaAsistenteRol;

  @ApiProperty({
    description: 'Email del asistente (opcional)',
    example: 'maria.garcia@email.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Teléfono del asistente (opcional)',
    example: '3001234567',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;
}
