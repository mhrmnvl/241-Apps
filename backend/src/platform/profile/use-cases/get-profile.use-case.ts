import { Injectable, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from '../domain/interfaces/profile-repository.interface.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { withAvatarUrl } from '../mappers/profile-avatar.mapper.js';

@Injectable()
export class GetProfileUseCase {
  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(userId: string) {
    const user = await this.profileRepository.findDetailByUserId(userId);

    if (!user?.profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    const profile = await withAvatarUrl(user.profile, this.storage);
    return { ...user, profile };
  }
}
