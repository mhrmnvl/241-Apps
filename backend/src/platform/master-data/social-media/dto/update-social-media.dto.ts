import { PartialType } from '@nestjs/swagger';
import { CreateSocialMediaDto } from './create-social-media.dto.js';

export class UpdateSocialMediaDto extends PartialType(CreateSocialMediaDto) {}
