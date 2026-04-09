import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaneacionDto } from './create-planeacion.dto';

export class UpdatePlaneacionDto extends PartialType(CreatePlaneacionDto) {}
