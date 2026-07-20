import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileSocialMediaDto } from '../dto/request/create-profile-social-media.dto.js';
import { ProfileSocialMediaRepository } from '../repositories/profile-social-media.repository.js';
import { ProfileRepository } from '../index.js';

@Injectable()
export class AddProfileSocialMediaUseCase {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly socialRepo: ProfileSocialMediaRepository,
  ) {}

  async execute(userId: string, dto: CreateProfileSocialMediaDto) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile)
      throw new NotFoundException(`Profile for user ID ${userId} not found`);

    return this.socialRepo.create(profile.id, dto);
  }
}
