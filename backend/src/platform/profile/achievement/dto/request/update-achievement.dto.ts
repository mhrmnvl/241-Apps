import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAchievementDto } from './create-achievement.dto.js';

export class UpdateAchievementDto extends PartialType(
  OmitType(CreateAchievementDto, ['profileId'] as const),
) {}
