import { IsUUID, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePtcFromCaseDto {
  @ApiProperty({
    description: 'ID del caso disciplinario desde el cual se creará el PTC',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  casoId: string;

  @ApiPropertyOptional({
    description: 'Motivo específico para crear el PTC desde este caso',
    example: 'Reincidencia en faltas académicas',
  })
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiPropertyOptional({
    description: 'Descripción adicional del PTC',
    example: 'Plan de mejoramiento académico y comportamental',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del PTC (ISO 8601). Si no se especifica, se usa la fecha actual',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;
}
