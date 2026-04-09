import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { TipoAmbiente, EstadoAmbiente } from '../entities/ambiente.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAmbienteDto {
  @ApiProperty({ example: 'Sala 4' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Chapinero' })
  @IsNotEmpty()
  @IsString()
  sede: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  @Max(500)
  capacidad: number;

  @ApiProperty({ enum: TipoAmbiente })
  @IsEnum(TipoAmbiente)
  tipo: TipoAmbiente;

  @ApiProperty({ enum: EstadoAmbiente, required: false })
  @IsOptional()
  @IsEnum(EstadoAmbiente)
  estado?: EstadoAmbiente;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ required: false, example: 'Computadores, Proyector' })
  @IsOptional()
  @IsString()
  equipamiento?: string;
}
