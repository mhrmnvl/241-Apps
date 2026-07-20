import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEducationalHistoryDto } from './create-educational-history.dto.js';

export class UpdateEducationalHistoryDto extends PartialType(
  OmitType(CreateEducationalHistoryDto, ['profileId'] as const),
) {}
