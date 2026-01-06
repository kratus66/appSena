import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { TipoDocumento, EstadoAcademico } from '../entities/aprendiz.entity';

export class CreateAprendizDto {
  @ApiProperty({
    example: 'Juan Carlos',
    description: 'Nombres del aprendiz',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  @MinLength(2, { message: 'Los nombres deben tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'Los nombres no pueden tener más de 100 caracteres' })
  nombres: string;

  @ApiProperty({
    example: 'Pérez González',
    description: 'Apellidos del aprendiz',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'Los apellidos no pueden tener más de 100 caracteres' })
  apellidos: string;

  @ApiProperty({
    example: 'CC',
    description: 'Tipo de documento',
    enum: TipoDocumento,
  })
  @IsEnum(TipoDocumento, { message: 'El tipo de documento debe ser CC, TI, CE o PAS' })
  @IsNotEmpty({ message: 'El tipo de documento es requerido' })
  tipoDocumento: TipoDocumento;

  @ApiProperty({
    example: '1234567890',
    description: 'Número de documento (único)',
    minLength: 5,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty({ message: 'El documento es requerido' })
  @MinLength(5, { message: 'El documento debe tener al menos 5 caracteres' })
  @MaxLength(20, { message: 'El documento no puede tener más de 20 caracteres' })
  @Matches(/^[0-9]+$/, { message: 'El documento solo puede contener números' })
  documento: string;

  @ApiProperty({
    example: 'aprendiz@email.com',
    description: 'Email del aprendiz (opcional)',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @MaxLength(100, { message: 'El email no puede tener más de 100 caracteres' })
  email?: string;

  @ApiProperty({
    example: '3001234567',
    description: 'Teléfono del aprendiz (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(7, { message: 'El teléfono debe tener al menos 7 caracteres' })
  @MaxLength(20, { message: 'El teléfono no puede tener más de 20 caracteres' })
  telefono?: string;

  @ApiProperty({
    example: 'Calle 123 # 45-67',
    description: 'Dirección del aprendiz (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'La dirección no puede tener más de 300 caracteres' })
  direccion?: string;

  @ApiProperty({
    example: 'ACTIVO',
    description: 'Estado académico inicial (por defecto ACTIVO)',
    enum: EstadoAcademico,
    required: false,
    default: EstadoAcademico.ACTIVO,
  })
  @IsOptional()
  @IsEnum(EstadoAcademico, { message: 'El estado académico debe ser ACTIVO, DESERTOR, RETIRADO o SUSPENDIDO' })
  estadoAcademico?: EstadoAcademico;

  @ApiProperty({
    example: 'uuid-user',
    description: 'ID del usuario asociado al aprendiz',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es requerido' })
  userId: string;

  @ApiProperty({
    example: 'uuid-ficha',
    description: 'ID de la ficha a la que pertenece el aprendiz',
  })
  @IsUUID('4', { message: 'El fichaId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El fichaId es requerido' })
  fichaId: string;
}
