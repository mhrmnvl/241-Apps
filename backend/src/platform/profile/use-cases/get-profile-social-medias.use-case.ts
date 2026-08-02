import { Injectable, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from '../index.js';
import { IProfileSocialMediaRepository } from '../domain/interfaces/profile-social-media-repository.interface.js';

@Injectable()
export class GetProfileSocialMediasUseCase {
  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly socialMediaRepository: IProfileSocialMediaRepository,
  ) {}

  async execute(userId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile)
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    return this.socialMediaRepository.findAllByProfileId(profile.id);
  }
}
