import { BadRequestException, Injectable } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import { FileRepository } from '../../file/repositories/file.repository.js';
import { ImageOptimizerService } from '../../file/index.js';
import { ALLOWED_UPLOAD_MIME_TYPES } from '../../file/constants/file-upload.constants.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { StorageKeyBuilder } from '../../../core/storage/storage-key-builder.service.js';
import {
  AppKey,
  AppSettingRepository,
} from '../repositories/app-setting.repository.js';
import { BRANDING_FILE_CATEGORY_CODE } from '../constants/branding-file-category.constant.js';
import { toAppSettingResponseDto } from '../mappers/app-setting.mapper.js';

@Injectable()
export class UploadAppSettingLogoUseCase {
  constructor(
    private readonly appSettingRepository: AppSettingRepository,
    private readonly fileRepository: FileRepository,
    private readonly imageOptimizer: ImageOptimizerService,
    private readonly storage: StorageService,
    private readonly keyBuilder: StorageKeyBuilder,
  ) {}

  async execute(appKey: AppKey, file: Express.Multer.File, updatedBy: string) {
    const detectedType = await fileTypeFromBuffer(file.buffer);
    if (
      !detectedType ||
      !ALLOWED_UPLOAD_MIME_TYPES.includes(
        detectedType.mime as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number],
      ) ||
      !detectedType.mime.startsWith('image/')
    ) {
      throw new BadRequestException('Logo must be an image file');
    }

    const optimized = await this.imageOptimizer.optimize(file.buffer);

    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${optimized.extension}`;
    const storageKey = this.keyBuilder.build(
      appKey,
      ['settings', 'branding'],
      uniqueFilename,
    );
    await this.storage.uploadFile(
      optimized.buffer,
      storageKey,
      optimized.mimeType,
    );

    const category = await this.fileRepository.findCategoryByCode(
      BRANDING_FILE_CATEGORY_CODE,
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
      updatedBy,
    );

    const entity = await this.appSettingRepository.setLogoFile(
      appKey,
      newFile.id,
    );
    return toAppSettingResponseDto(entity, this.storage);
  }
}
