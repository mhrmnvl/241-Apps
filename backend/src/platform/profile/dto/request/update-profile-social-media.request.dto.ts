import { PartialType } from '@nestjs/swagger';
import { CreateProfileSocialMediaDto } from './create-profile-social-media.request.dto.js';

export class UpdateProfileSocialMediaDto extends PartialType(
  CreateProfileSocialMediaDto,
) {}
