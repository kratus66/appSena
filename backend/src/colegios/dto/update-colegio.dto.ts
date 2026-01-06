import { PartialType } from '@nestjs/swagger';
import { CreateColegioDto } from './create-colegio.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateColegioDto extends PartialType(CreateColegioDto) {
  @ApiProperty({
    example: true,
    description: 'Si el colegio está activo',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
