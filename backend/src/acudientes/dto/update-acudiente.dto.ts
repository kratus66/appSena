import { PartialType } from '@nestjs/swagger';
import { CreateAcudienteDto } from './create-acudiente.dto';

export class UpdateAcudienteDto extends PartialType(CreateAcudienteDto) {}
