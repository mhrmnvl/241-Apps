import { Injectable, NotFoundException } from '@nestjs/common';
import { IProfileRepository } from '../domain/interfaces/profile-repository.interface.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { withAvatarUrl } from '../mappers/profile-avatar.mapper.js';

@Injectable()
export class DeleteProfilePhotoUseCase {
  constructor(
    private readonly profileRepository: IProfileRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(userId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    const storageKey = profile.avatarFile?.storageKey;
    if (storageKey) {
      await this.storage.deleteFile(storageKey).catch(() => {
        // Non-fatal: S3 object may already be gone
      });
    }

    const updated = await this.profileRepository.update(userId, {
      avatarFileId: null,
    });

    return withAvatarUrl(updated, this.storage);
  }
}
