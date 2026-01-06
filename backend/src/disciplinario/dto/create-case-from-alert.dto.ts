import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum, IsString, IsOptional } from 'class-validator';
import { CaseGravedad } from '../entities/disciplinary-case.entity';

export class CreateCaseFromAlertDto {
  @ApiProperty({
    description: 'ID de la ficha asociada',
    example: 'uuid-ficha',
  })
  @IsNotEmpty({ message: 'El fichaId es obligatorio' })
  @IsUUID('4', { message: 'El fichaId debe ser un UUID válido' })
  fichaId: string;

  @ApiProperty({
    description: 'ID del aprendiz involucrado',
    example: 'uuid-aprendiz',
  })
  @IsNotEmpty({ message: 'El aprendizId es obligatorio' })
  @IsUUID('4', { message: 'El aprendizId debe ser un UUID válido' })
  aprendizId: string;

  @ApiProperty({
    description: 'Criterio de alerta que generó el caso',
    example: '3_CONSECUTIVAS',
    enum: ['3_CONSECUTIVAS', '5_AL_MES'],
  })
  @IsNotEmpty({ message: 'El criterio de alerta es obligatorio' })
  @IsEnum(['3_CONSECUTIVAS', '5_AL_MES'], {
    message: 'El criterio debe ser uno de: 3_CONSECUTIVAS, 5_AL_MES',
  })
  criterioAlerta: '3_CONSECUTIVAS' | '5_AL_MES';

  @ApiProperty({
    description: 'Gravedad del caso (opcional, por defecto MEDIA)',
    enum: CaseGravedad,
    example: 'MEDIA',
    required: false,
  })
  @IsOptional()
  @IsEnum(CaseGravedad, { message: 'La gravedad debe ser una de: LEVE, MEDIA, ALTA' })
  gravedad?: CaseGravedad;

  @ApiProperty({
    description: 'Descripción adicional (opcional)',
    example: 'Detalles adicionales sobre la alerta...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcionAuto?: string;
}
