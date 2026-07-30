import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../index.js';
import { ProfileSocialMediaRepository } from '../repositories/profile-social-media.repository.js';

@Injectable()
export class GetProfileSocialMediasUseCase {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly socialMediaRepository: ProfileSocialMediaRepository,
  ) {}

  async execute(userId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile)
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    return this.socialMediaRepository.findAllByProfileId(profile.id);
  }
}
