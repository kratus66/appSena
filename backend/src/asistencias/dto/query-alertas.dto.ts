import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAlertasDto {
  @ApiPropertyOptional({
    description: 'Mes en formato YYYY-MM (por defecto mes actual)',
    example: '2024-01',
  })
  @IsOptional()
  @IsString({ message: 'El mes debe ser una cadena de texto' })
  @Matches(/^\d{4}-\d{2}$/, { message: 'El mes debe estar en formato YYYY-MM' })
  month?: string;

  @ApiPropertyOptional({
    description: 'Incluir detalles de sesiones en la respuesta',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'includeDetails debe ser un booleano' })
  includeDetails?: boolean = false;
}
