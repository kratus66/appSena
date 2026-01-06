import { PartialType } from '@nestjs/swagger';
import { CreateCaseActionDto } from './create-case-action.dto';

export class UpdateCaseActionDto extends PartialType(CreateCaseActionDto) {}
