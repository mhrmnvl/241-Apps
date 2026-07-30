import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../index.js';
import { ProfileSocialMediaRepository } from '../repositories/profile-social-media.repository.js';

@Injectable()
export class RemoveProfileSocialMediaUseCase {
  private readonly logger = new Logger(RemoveProfileSocialMediaUseCase.name);

  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly socialMediaRepository: ProfileSocialMediaRepository,
  ) {}

  async execute(userId: string, socialMediaId: string): Promise<void> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile)
      throw new NotFoundException(`Profile for user ID ${userId} not found`);

    const sm = await this.socialMediaRepository.findByIdAndProfile(
      socialMediaId,
      profile.id,
    );
    if (!sm)
      throw new NotFoundException(
        `Social media with ID ${socialMediaId} not found for this profile`,
      );

    await this.socialMediaRepository.remove(socialMediaId);
    this.logger.log(`Social media ${socialMediaId} removed for user ${userId}`);
  }
}
