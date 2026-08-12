import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppKey } from '../../platform/settings/domain/entities/app-setting.entity.js';
import * as path from 'path';
import { isEditable } from '../domain/admission-status.transitions.js';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';
import { StorageService } from '../../core/storage/storage.service.js';
import { StorageKeyBuilder } from '../../core/storage/storage-key-builder.service.js';

export const ADMISSION_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
];
export const ADMISSION_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function assertValidAdmissionFile(file: Express.Multer.File): void {
  if (!ADMISSION_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new BadRequestException('File must be a JPG, PNG or PDF');
  }
  if (file.size > ADMISSION_MAX_FILE_SIZE) {
    throw new BadRequestException('Ukuran berkas maksimal 5 MB');
  }
}

/**
 * Saves an admission upload under admission/{...segments}/{filename} — e.g.
 * ['documents', 'Kartu Keluarga'] groups every applicant's KK together, or
 * ['payments'] for payment proofs, instead of nesting per-application.
 */
export async function saveAdmissionFile(
  storage: StorageService,
  keyBuilder: StorageKeyBuilder,
  file: Express.Multer.File,
  segments: string[],
): Promise<{ filename: string; storageKey: string }> {
  const fileExt = path.extname(file.originalname);
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
  const storageKey = keyBuilder.build(AppKey.ADMISSION, segments, filename);
  await storage.uploadFile(file.buffer, storageKey, file.mimetype);
  return { filename, storageKey };
}

@Injectable()
export class UploadAdmissionDocumentUseCase {
  constructor(
    private readonly admissionApplicantRepository: IAdmissionApplicantRepository,
    private readonly storage: StorageService,
    private readonly keyBuilder: StorageKeyBuilder,
  ) {}

  async execute(
    userId: string,
    documentTypeCode: string,
    file: Express.Multer.File,
  ) {
    assertValidAdmissionFile(file);

    const application =
      await this.admissionApplicantRepository.findMyApplication(userId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (!isEditable(application.status)) {
      throw new ConflictException(
        'Documents can only be uploaded while the application is DRAFT or NEEDS_REVISION',
      );
    }

    const documentType =
      await this.admissionApplicantRepository.findDocumentTypeByCode(
        documentTypeCode,
      );
    if (!documentType) {
      throw new NotFoundException(
        `Unknown document type '${documentTypeCode}'`,
      );
    }

    const docTypeName = String(documentType.name ?? '');
    const docTypeId = String(documentType.id ?? '');

    const { filename, storageKey } = await saveAdmissionFile(
      this.storage,
      this.keyBuilder,
      file,
      ['documents', docTypeName],
    );

    return this.admissionApplicantRepository.saveDocument({
      applicationId: application.id,
      documentTypeId: docTypeId,
      file: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageKey,
        uploadedBy: userId,
      },
    });
  }
}
