import { PartialType } from '@nestjs/swagger';
import { CreateAchievementTypeDto } from './create-achievement-type.dto.js';

export class UpdateAchievementTypeDto extends PartialType(
  CreateAchievementTypeDto,
) {}
