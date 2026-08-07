import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import { IFileRepository } from '../domain/interfaces/file-repository.interface.js';
import { AppKey } from '../../settings/domain/entities/app-setting.entity.js';
import { CreateFileDto } from '../dto/request/create-file.dto.js';
import { ImageOptimizerService } from '../domain/interfaces/image-optimizer.interface.js';
import { StorageService } from '../../../core/storage/storage.service.js';
import { StorageKeyBuilder } from '../../../core/storage/storage-key-builder.service.js';
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  OPTIMIZABLE_IMAGE_MIME_TYPES,
  sharePreviewKey,
} from '../constants/file-upload.constants.js';

const UNCATEGORIZED_FOLDER = 'Umum';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

@Injectable()
export class UploadFileUseCase {
  private readonly logger = new Logger(UploadFileUseCase.name);

  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly imageOptimizer: ImageOptimizerService,
    private readonly storage: StorageService,
    private readonly keyBuilder: StorageKeyBuilder,
  ) {}

  async execute(
    file: Express.Multer.File,
    appKey: AppKey,
    categoryId?: string,
    uploadedBy?: string,
  ) {
    if (file.buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        'File size exceeds the maximum limit of 10MB',
      );
    }

    // Trust the magic bytes, not the client-supplied mimetype/extension.
    const detectedType = await fileTypeFromBuffer(file.buffer);
    if (
      !detectedType ||
      !ALLOWED_UPLOAD_MIME_TYPES.includes(
        detectedType.mime as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException('File type is not allowed');
    }

    let buffer: Buffer = file.buffer;
    let mimeType: string = detectedType.mime;
    let fileExt = `.${detectedType.ext}`;

    if (
      OPTIMIZABLE_IMAGE_MIME_TYPES.includes(
        detectedType.mime as (typeof OPTIMIZABLE_IMAGE_MIME_TYPES)[number],
      )
    ) {
      const optimized = await this.imageOptimizer.optimize(file.buffer);
      buffer = optimized.buffer;
      mimeType = optimized.mimeType;
      fileExt = optimized.extension;
    }

    const category = categoryId
      ? await this.fileRepository.findCategoryById(categoryId)
      : null;

    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const storageKey = this.keyBuilder.build(
      appKey,
      ['files', category?.name ?? UNCATEGORIZED_FOLDER],
      uniqueFilename,
    );
    await this.storage.uploadFile(buffer, storageKey, mimeType);
    await this.uploadSharePreview(file.buffer, storageKey, detectedType.mime);

    const dto: CreateFileDto = {
      categoryId,
      filename: uniqueFilename,
      originalName: file.originalname,
      mimeType,
      sizeBytes: buffer.length,
      storageKey,
    };

    const entity = await this.fileRepository.create(dto, uploadedBy);
    return { ...entity, url: await this.storage.getSignedUrl(storageKey) };
  }

  /**
   * Generates and stores the 1200×630 JPEG a link-preview crawler is served
   * (FR-065). Its key is derived from the original's, so nothing has to be
   * recorded in the database to find it later — `sharePreviewKey()` is the
   * single definition of where it lives.
   *
   * Best-effort on purpose. A failed preview costs a link card with no image;
   * failing the upload would cost the editor their file over a variant they
   * did not ask for. The warning is what makes a systematic failure visible.
   */
  private async uploadSharePreview(
    original: Buffer,
    storageKey: string,
    detectedMime: string,
  ): Promise<void> {
    if (
      !OPTIMIZABLE_IMAGE_MIME_TYPES.includes(
        detectedMime as (typeof OPTIMIZABLE_IMAGE_MIME_TYPES)[number],
      )
    ) {
      return;
    }

    try {
      const preview = await this.imageOptimizer.buildSharePreview(original);
      await this.storage.uploadFile(
        preview.buffer,
        sharePreviewKey(storageKey),
        preview.mimeType,
      );
    } catch (error) {
      this.logger.warn(
        `Share-preview generation failed for ${storageKey}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
