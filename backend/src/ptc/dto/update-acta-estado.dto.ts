import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActaEstado } from '../entities/acta.entity';

export class UpdateActaEstadoDto {
  @ApiProperty({
    description: 'Nuevo estado del acta',
    enum: ActaEstado,
    example: ActaEstado.FIRMABLE,
  })
  @IsEnum(ActaEstado)
  estado: ActaEstado;

  @ApiProperty({
    description: 'Resumen del cierre (obligatorio si estado es CERRADA)',
    example: 'Acta cerrada con todos los compromisos registrados',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  cierreResumen?: string;
}
