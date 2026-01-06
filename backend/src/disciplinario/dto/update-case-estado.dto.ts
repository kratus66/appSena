import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsString, IsOptional } from 'class-validator';
import { CaseEstado } from '../entities/disciplinary-case.entity';

export class UpdateCaseEstadoDto {
  @ApiProperty({
    description: 'Nuevo estado del caso',
    enum: CaseEstado,
    example: 'ABIERTO',
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsEnum(CaseEstado, {
    message: 'El estado debe ser uno de: BORRADOR, ABIERTO, SEGUIMIENTO, CERRADO',
  })
  estado: CaseEstado;

  @ApiProperty({
    description: 'Resumen del cierre (obligatorio si el estado es CERRADO)',
    example: 'Se aplicó el protocolo de convivencia y el aprendiz aceptó compromisos...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El resumen de cierre debe ser una cadena de texto' })
  cierreResumen?: string;
}
