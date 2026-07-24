import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { withAvatarUrl } from '../infrastructure/profile-avatar.mapper.js';

@Injectable()
export class DeleteProfilePhotoUseCase {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(userId: string) {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    const storageKey = profile.avatarFile?.storageKey;
    if (storageKey) {
      await this.storage.deleteFile(storageKey).catch(() => {
        // Non-fatal: S3 object may already be gone
      });
    }

    const updated = await this.profileRepo.update(userId, {
      avatarFile: { disconnect: true },
    });

    return withAvatarUrl(updated, this.storage);
  }
}
