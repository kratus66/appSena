import { IsOptional, IsString, Matches, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryRangoFechasDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango (ISO 8601)',
    example: '2026-01-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  hasta?: string;

  @ApiPropertyOptional({
    description: 'Mes en formato YYYY-MM (alternativa a desde/hasta)',
    example: '2026-01',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'El formato del mes debe ser YYYY-MM',
  })
  month?: string;
}
