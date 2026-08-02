import { Module } from '@nestjs/common';
import { SchoolUnitModule } from '../../school-unit/school-unit.module.js';
import { ProfileModule } from '../../profile/profile.module.js';
import { SocialMediaController } from './presentation/social-media.controller.js';
import { PrismaSocialMediaRepository } from './infrastructure/persistence/prisma-social-media.repository.js';
import { ISocialMediaRepository } from './domain/interfaces/social-media-repository.interface.js';
import { CreateSocialMediaUseCase } from './use-cases/create-social-media.use-case.js';
import { DeleteSocialMediaUseCase } from './use-cases/delete-social-media.use-case.js';
import { GetSocialMediaByIdUseCase } from './use-cases/get-social-media-by-id.use-case.js';
import { GetSocialMediasUseCase } from './use-cases/get-social-medias.use-case.js';
import { UpdateSocialMediaUseCase } from './use-cases/update-social-media.use-case.js';

@Module({
  imports: [SchoolUnitModule, ProfileModule],
  controllers: [SocialMediaController],
  providers: [
    { provide: ISocialMediaRepository, useClass: PrismaSocialMediaRepository },
    GetSocialMediasUseCase,
    GetSocialMediaByIdUseCase,
    CreateSocialMediaUseCase,
    UpdateSocialMediaUseCase,
    DeleteSocialMediaUseCase,
  ],
  exports: [ISocialMediaRepository],
})
export class SocialMediaModule {}
