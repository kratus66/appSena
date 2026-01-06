import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, ValidateNested, ArrayMinSize, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class RegistroAsistenciaItemDto {
  @ApiProperty({
    description: 'ID del aprendiz',
    example: 'uuid-aprendiz',
  })
  @IsNotEmpty({ message: 'El aprendizId es obligatorio' })
  @IsUUID('4', { message: 'El aprendizId debe ser un UUID válido' })
  aprendizId: string;

  @ApiProperty({
    description: 'Indica si el aprendiz estuvo presente',
    example: true,
  })
  @IsNotEmpty({ message: 'El campo presente es obligatorio' })
  @IsBoolean({ message: 'El campo presente debe ser un booleano' })
  presente: boolean;
}

export class RegistrarAsistenciaDto {
  @ApiProperty({
    description: 'Lista de asistencias a registrar',
    type: [RegistroAsistenciaItemDto],
  })
  @IsNotEmpty({ message: 'La lista de asistencias es obligatoria' })
  @IsArray({ message: 'Las asistencias deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe haber al menos una asistencia' })
  @ValidateNested({ each: true })
  @Type(() => RegistroAsistenciaItemDto)
  asistencias: RegistroAsistenciaItemDto[];
}
