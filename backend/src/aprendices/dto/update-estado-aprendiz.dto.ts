import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoAcademico } from '../entities/aprendiz.entity';

export class UpdateEstadoAprendizDto {
  @ApiProperty({
    example: 'DESERTOR',
    description: 'Nuevo estado académico del aprendiz',
    enum: EstadoAcademico,
  })
  @IsEnum(EstadoAcademico, {
    message: 'El estado académico debe ser ACTIVO, DESERTOR, RETIRADO o SUSPENDIDO',
  })
  @IsNotEmpty({ message: 'El estado académico es requerido' })
  estadoAcademico: EstadoAcademico;
}
