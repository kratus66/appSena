import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoFicha } from '../entities/ficha.entity';

export class UpdateFichaEstadoDto {
  @ApiProperty({
    example: 'EN_CIERRE',
    description: 'Nuevo estado de la ficha (solo coordinadores/admin)',
    enum: EstadoFicha,
  })
  @IsEnum(EstadoFicha, { message: 'El estado debe ser ACTIVA, EN_CIERRE o FINALIZADA' })
  @IsNotEmpty({ message: 'El estado es requerido' })
  estado: EstadoFicha;
}
