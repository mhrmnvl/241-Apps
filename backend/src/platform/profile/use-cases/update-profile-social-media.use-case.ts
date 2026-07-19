import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../index.js';
import { ProfileSocialMediaRepository } from '../repositories/profile-social-media.repository.js';
import { UpdateProfileSocialMediaDto } from '../dto/request/update-profile-social-media.request.dto.js';

@Injectable()
export class UpdateProfileSocialMediaUseCase {
  private readonly logger = new Logger(UpdateProfileSocialMediaUseCase.name);

  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly socialRepo: ProfileSocialMediaRepository,
  ) {}

  async execute(
    userId: string,
    socialMediaId: string,
    dto: UpdateProfileSocialMediaDto,
  ) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile)
      throw new NotFoundException(`Profile for user ID ${userId} not found`);

    const sm = await this.socialRepo.findByIdAndProfile(
      socialMediaId,
      profile.id,
    );
    if (!sm)
      throw new NotFoundException(
        `Social media with ID ${socialMediaId} not found for this profile`,
      );

    const updated = await this.socialRepo.update(socialMediaId, dto);
    this.logger.log(`Social media ${socialMediaId} updated for user ${userId}`);
    return updated;
  }
}
