import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from '../index.js';
import { IProfileSocialMediaRepository } from '../domain/interfaces/profile-social-media-repository.interface.js';
import { UpdateProfileSocialMediaDto } from '../dto/request/update-profile-social-media.dto.js';

@Injectable()
export class UpdateProfileSocialMediaUseCase {
  private readonly logger = new Logger(UpdateProfileSocialMediaUseCase.name);

  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly socialMediaRepository: IProfileSocialMediaRepository,
  ) {}

  async execute(
    userId: string,
    socialMediaId: string,
    dto: UpdateProfileSocialMediaDto,
  ) {
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

    const updated = await this.socialMediaRepository.update(socialMediaId, {
      username: dto.username,
    });
    this.logger.log(`Social media ${socialMediaId} updated for user ${userId}`);
    return updated;
  }
}
