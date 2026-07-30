import { BadRequestException, Injectable } from '@nestjs/common';
import { AppKey } from '@prisma/client';
import { fileTypeFromBuffer } from 'file-type';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { FileRepository } from '../../file/repositories/file.repository.js';
import { ImageOptimizerService } from '../../file/infrastructure/image-optimizer.service.js';
import { ALLOWED_UPLOAD_MIME_TYPES } from '../../file/constants/file-upload.constants.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { StorageKeyBuilder } from '../../../core/storage/storage-key-builder.service.js';
import { withAvatarUrl } from '../infrastructure/profile-avatar.mapper.js';

const PROFILE_PHOTO_CATEGORY_CODE = 'PROFILE_PHOTO';
const AVATAR_MAX_DIMENSION = 512;

@Injectable()
export class UploadProfilePhotoUseCase {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly fileRepository: FileRepository,
    private readonly imageOptimizer: ImageOptimizerService,
    private readonly storage: StorageService,
    private readonly keyBuilder: StorageKeyBuilder,
  ) {}

  async execute(userId: string, appKey: AppKey, file: Express.Multer.File) {
    const detectedType = await fileTypeFromBuffer(file.buffer);
    if (
      !detectedType ||
      !ALLOWED_UPLOAD_MIME_TYPES.includes(
        detectedType.mime as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number],
      ) ||
      !detectedType.mime.startsWith('image/')
    ) {
      throw new BadRequestException('Profile photo must be an image file');
    }

    const optimized = await this.imageOptimizer.optimize(file.buffer, {
      maxWidth: AVATAR_MAX_DIMENSION,
      maxHeight: AVATAR_MAX_DIMENSION,
    });

    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${optimized.extension}`;
    const storageKey = this.keyBuilder.build(
      appKey,
      ['profile', 'photo'],
      uniqueFilename,
    );
    await this.storage.uploadFile(
      optimized.buffer,
      storageKey,
      optimized.mimeType,
    );

    const category = await this.fileRepository.findCategoryByCode(
      PROFILE_PHOTO_CATEGORY_CODE,
    );

    const newFile = await this.fileRepository.create(
      {
        categoryId: category?.id,
        filename: uniqueFilename,
        originalName: file.originalname,
        mimeType: optimized.mimeType,
        sizeBytes: optimized.buffer.length,
        storageKey,
      },
      userId,
    );

    const updated = await this.profileRepository.update(userId, {
      avatarFile: { connect: { id: newFile.id } },
    });

    return withAvatarUrl(updated, this.storage);
  }
}
