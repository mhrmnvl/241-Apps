import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSemesterDto } from './create-semester.dto.js';

export class UpdateSemesterDto extends PartialType(
  OmitType(CreateSemesterDto, ['isActive'] as const),
) {}
