import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { withAvatarUrl } from '../infrastructure/profile-avatar.mapper.js';

@Injectable()
export class GetProfileUseCase {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(userId: string) {
    const user = await this.repository.findDetailByUserId(userId);

    if (!user?.profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    const profile = await withAvatarUrl(user.profile, this.storage);
    return { ...user, profile };
  }
}
