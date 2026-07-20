import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateScholarshipDto } from './create-scholarship.dto.js';

export class UpdateScholarshipDto extends PartialType(
  OmitType(CreateScholarshipDto, ['profileId'] as const),
) {}
