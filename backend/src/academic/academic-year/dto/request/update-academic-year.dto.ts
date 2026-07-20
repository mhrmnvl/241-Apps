import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAcademicYearDto } from './create-academic-year.dto.js';

export class UpdateAcademicYearDto extends PartialType(
  OmitType(CreateAcademicYearDto, ['isActive'] as const),
) {}
