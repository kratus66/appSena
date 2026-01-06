import { PartialType } from '@nestjs/swagger';
import { CreatePtcDto } from './create-ptc.dto';

export class UpdatePtcDto extends PartialType(CreatePtcDto) {}
