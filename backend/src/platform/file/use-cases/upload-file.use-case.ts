import { BadRequestException, Injectable } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import { FileRepository } from '../repositories/file.repository.js';
import { CreateFileDto } from '../dto/request/create-file.dto.js';
import { ImageOptimizerService } from '../infrastructure/image-optimizer.service.js';
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  OPTIMIZABLE_IMAGE_MIME_TYPES,
} from '../constants/file-upload.constants.js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadFileUseCase {
  constructor(
    private readonly repo: FileRepository,
    private readonly imageOptimizer: ImageOptimizerService,
  ) {}

  async execute(
    file: Express.Multer.File,
    categoryId?: string,
    uploadedBy?: string,
  ) {
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

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    fs.writeFileSync(filePath, buffer);

    const dto: CreateFileDto = {
      categoryId,
      filename: uniqueFilename,
      originalName: file.originalname,
      mimeType,
      sizeBytes: buffer.length,
      storageKey: `uploads/${uniqueFilename}`,
    };

    return this.repo.create(dto, uploadedBy);
  }
}
