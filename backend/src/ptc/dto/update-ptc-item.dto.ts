import { PartialType } from '@nestjs/swagger';
import { CreatePtcItemDto } from './create-ptc-item.dto';

export class UpdatePtcItemDto extends PartialType(CreatePtcItemDto) {}
