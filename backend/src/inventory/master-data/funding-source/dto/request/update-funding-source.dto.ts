import { PartialType } from '@nestjs/swagger';
import { CreateFundingSourceDto } from './create-funding-source.dto.js';

export class UpdateFundingSourceDto extends PartialType(
  CreateFundingSourceDto,
) {}
