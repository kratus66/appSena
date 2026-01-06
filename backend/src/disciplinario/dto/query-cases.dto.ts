import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CaseTipo, CaseGravedad, CaseEstado } from '../entities/disciplinary-case.entity';

export class QueryCasesDto {
  @ApiProperty({
    description: 'ID de la ficha (filtro)',
    example: 'uuid-ficha',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El fichaId debe ser un UUID válido' })
  fichaId?: string;

  @ApiProperty({
    description: 'ID del aprendiz (filtro)',
    example: 'uuid-aprendiz',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El aprendizId debe ser un UUID válido' })
  aprendizId?: string;

  @ApiProperty({
    description: 'ID del colegio (filtro)',
    example: 'uuid-colegio',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El colegioId debe ser un UUID válido' })
  colegioId?: string;

  @ApiProperty({
    description: 'ID del programa (filtro)',
    example: 'uuid-programa',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El programaId debe ser un UUID válido' })
  programaId?: string;

  @ApiProperty({
    description: 'Estado del caso (filtro)',
    enum: CaseEstado,
    example: 'ABIERTO',
    required: false,
  })
  @IsOptional()
  @IsEnum(CaseEstado, {
    message: 'El estado debe ser uno de: BORRADOR, ABIERTO, SEGUIMIENTO, CERRADO',
  })
  estado?: CaseEstado;

  @ApiProperty({
    description: 'Tipo de caso (filtro)',
    enum: CaseTipo,
    example: 'CONVIVENCIA',
    required: false,
  })
  @IsOptional()
  @IsEnum(CaseTipo, {
    message: 'El tipo debe ser uno de: CONVIVENCIA, ACADEMICO, ASISTENCIA, OTRO',
  })
  tipo?: CaseTipo;

  @ApiProperty({
    description: 'Gravedad del caso (filtro)',
    enum: CaseGravedad,
    example: 'ALTA',
    required: false,
  })
  @IsOptional()
  @IsEnum(CaseGravedad, { message: 'La gravedad debe ser una de: LEVE, MEDIA, ALTA' })
  gravedad?: CaseGravedad;

  @ApiProperty({
    description: 'Fecha desde (filtro por fecha de incidente)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe ser válida en formato ISO (YYYY-MM-DD)' })
  desde?: string;

  @ApiProperty({
    description: 'Fecha hasta (filtro por fecha de incidente)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe ser válida en formato ISO (YYYY-MM-DD)' })
  hasta?: string;

  @ApiProperty({
    description: 'Búsqueda por asunto, documento o nombre del aprendiz',
    example: 'Juan',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  search?: string;

  @ApiProperty({
    description: 'Número de página',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Cantidad de resultados por página',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  limit?: number = 10;
}
