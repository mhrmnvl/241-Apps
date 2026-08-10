import { PartialType } from '@nestjs/swagger';
import { CreateWorkPatternDto } from './create-work-pattern.dto.js';

export class UpdateWorkPatternDto extends PartialType(CreateWorkPatternDto) {}
