import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PtcEstado } from '../entities/ptc.entity';

export class UpdatePtcEstadoDto {
  @ApiProperty({
    description: 'Nuevo estado del PTC',
    enum: PtcEstado,
    example: PtcEstado.VIGENTE,
  })
  @IsEnum(PtcEstado)
  estado: PtcEstado;

  @ApiProperty({
    description: 'Resumen del cierre (obligatorio si estado es CERRADO)',
    example: 'El aprendiz cumplió con el 80% de los compromisos establecidos',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  cierreResumen?: string;
}
