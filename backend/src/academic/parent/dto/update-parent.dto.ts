import { PartialType } from '@nestjs/swagger';
import { CreateParentDto } from './create-parent.dto.js';

export class UpdateParentDto extends PartialType(CreateParentDto) {}
