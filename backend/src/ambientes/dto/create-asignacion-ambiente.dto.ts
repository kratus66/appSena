import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { DiaSemana, JornadaBloque } from '../entities/asignacion-ambiente.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAsignacionAmbienteDto {
  @ApiProperty({ description: 'ID de la ficha', required: false })
  @IsOptional()
  @IsUUID()
  fichaId?: string;

  @ApiProperty({ description: 'ID del instructor', required: false })
  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @ApiProperty({ enum: DiaSemana })
  @IsNotEmpty()
  @IsEnum(DiaSemana)
  dia: DiaSemana;

  @ApiProperty({ enum: JornadaBloque })
  @IsNotEmpty()
  @IsEnum(JornadaBloque)
  jornada: JornadaBloque;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}
