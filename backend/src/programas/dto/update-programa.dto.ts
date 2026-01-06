import { PartialType } from '@nestjs/swagger';
import { CreateProgramaDto } from './create-programa.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateProgramaDto extends PartialType(CreateProgramaDto) {
  @ApiProperty({
    example: true,
    description: 'Si el programa está activo',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
