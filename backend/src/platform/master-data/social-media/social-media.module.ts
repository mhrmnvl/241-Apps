import { Module } from '@nestjs/common';
import { SchoolUnitModule } from '../../school-unit/school-unit.module.js';
import { ProfileModule } from '../../profile/profile.module.js';
import { SocialMediaController } from './controllers/social-media.controller.js';
import { SocialMediaRepository } from './repositories/social-media.repository.js';
import { ISocialMediaRepository } from './interfaces/social-media-repository.interface.js';
import { CreateSocialMediaService } from './services/create-social-media.service.js';
import { DeleteSocialMediaService } from './services/delete-social-media.service.js';
import { GetSocialMediaByIdService } from './services/get-social-media-by-id.service.js';
import { GetSocialMediasService } from './services/get-social-medias.service.js';
import { UpdateSocialMediaService } from './services/update-social-media.service.js';

@Module({
  imports: [SchoolUnitModule, ProfileModule],
  controllers: [SocialMediaController],
  providers: [
    { provide: ISocialMediaRepository, useClass: SocialMediaRepository },
    GetSocialMediasService,
    GetSocialMediaByIdService,
    CreateSocialMediaService,
    UpdateSocialMediaService,
    DeleteSocialMediaService,
  ],
  exports: [ISocialMediaRepository],
})
export class SocialMediaModule {}
