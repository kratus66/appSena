import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  IsUUID,
} from 'class-validator';
import {
  DependenciaPlaneacion,
  EstadoPlaneacion,
  ModalidadPlaneacion,
} from '../entities/planeacion.entity';

export class CreatePlaneacionDto {
  @IsEnum(DependenciaPlaneacion)
  dependencia: DependenciaPlaneacion;

  @IsOptional()
  @IsUUID()
  fichaId?: string;

  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @IsOptional()
  @IsUUID()
  ambienteId?: string;

  @IsNotEmpty()
  @IsString()
  fichaNumero: string;

  @IsNotEmpty()
  @IsString()
  programa: string;

  @IsNotEmpty()
  @IsString()
  instructorNombre: string;

  @IsOptional()
  @IsString()
  instructorArea?: string;

  @IsOptional()
  @IsString()
  ambienteNombre?: string;

  @IsOptional()
  @IsArray()
  bloques?: string[];

  @IsOptional()
  @IsInt()
  horasAsignadas?: number;

  @IsOptional()
  @IsEnum(EstadoPlaneacion)
  estado?: EstadoPlaneacion;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsString()
  siteContext?: string;

  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsString()
  localidad?: string;

  @IsOptional()
  @IsEnum(ModalidadPlaneacion)
  modalidad?: ModalidadPlaneacion;

  @IsOptional()
  @IsString()
  jornada?: string;

  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @IsOptional()
  @IsString()
  fechaFin?: string;
}
