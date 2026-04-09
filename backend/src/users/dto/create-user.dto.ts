import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DependenciaInstructor, EstadoDisponibilidad, UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'juan.perez@sena.edu.co' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  documento: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.INSTRUCTOR })
  @IsNotEmpty()
  @IsEnum(UserRole)
  rol: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fotoPerfil?: string;

  // ── Perfil de instructor ──────────────────────────────────────────────────
  @ApiPropertyOptional({ example: 'Ingeniero de Sistemas' })
  @IsOptional()
  @IsString()
  profesion?: string;

  @ApiPropertyOptional({ enum: DependenciaInstructor })
  @IsOptional()
  @IsEnum(DependenciaInstructor)
  dependencia?: DependenciaInstructor;

  @ApiPropertyOptional({ example: 'Tecnología e Informática' })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional({ example: 'Titulada' })
  @IsOptional()
  @IsString()
  tipoPrograma?: string;

  @ApiPropertyOptional({ example: 'Chapinero' })
  @IsOptional()
  @IsString()
  sede?: string;

  @ApiPropertyOptional({ example: '2023-01-15' })
  @IsOptional()
  @IsDateString()
  fechaInicioContrato?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  fechaFinContrato?: string;

  @ApiPropertyOptional({ example: 'IED La Candelaria' })
  @IsOptional()
  @IsString()
  colegioArticulacion?: string;

  @ApiPropertyOptional({ example: 'Compartida' })
  @IsOptional()
  @IsString()
  modalidadArticulacion?: string;

  @ApiPropertyOptional({ example: 'AM' })
  @IsOptional()
  @IsString()
  jornadaArticulacion?: string;

  @ApiPropertyOptional({ example: 'Chapinero' })
  @IsOptional()
  @IsString()
  localidad?: string;

  @ApiPropertyOptional({ enum: EstadoDisponibilidad })
  @IsOptional()
  @IsEnum(EstadoDisponibilidad)
  estadoDisponibilidad?: EstadoDisponibilidad;
}
