import { PartialType } from '@nestjs/swagger';
import { CreateSchoolUnitSocialMediaDto } from './create-school-unit-social-media.dto.js';

export class UpdateSchoolUnitSocialMediaDto extends PartialType(
  CreateSchoolUnitSocialMediaDto,
) {}
