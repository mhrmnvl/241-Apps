import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { isEditable } from '../domain/admission-status.transitions.js';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';

export const ADMISSION_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
];
export const ADMISSION_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function assertValidAdmissionFile(file: Express.Multer.File): void {
  if (!ADMISSION_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new BadRequestException('Format berkas harus JPG, PNG, atau PDF');
  }
  if (file.size > ADMISSION_MAX_FILE_SIZE) {
    throw new BadRequestException('Ukuran berkas maksimal 5 MB');
  }
}

export function saveAdmissionFile(
  file: Express.Multer.File,
  subdir: string,
): { filename: string; storageKey: string } {
  const uploadDir = path.join(process.cwd(), 'uploads', 'admission', subdir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const fileExt = path.extname(file.originalname);
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
  return { filename, storageKey: `uploads/admission/${subdir}/${filename}` };
}

@Injectable()
export class UploadAdmissionDocumentUseCase {
  constructor(private readonly repository: IAdmissionApplicantRepository) {}

  async execute(
    userId: string,
    documentTypeCode: string,
    file: Express.Multer.File,
  ) {
    assertValidAdmissionFile(file);

    const application = await this.repository.findMyApplication(userId);
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }
    if (!isEditable(application.status)) {
      throw new ConflictException(
        'Berkas hanya dapat diunggah saat status Draft atau Perlu Revisi',
      );
    }

    const documentType =
      await this.repository.findDocumentTypeByCode(documentTypeCode);
    if (!documentType) {
      throw new NotFoundException(
        `Jenis berkas '${documentTypeCode}' tidak dikenal`,
      );
    }

    const { filename, storageKey } = saveAdmissionFile(file, application.id);

    return this.repository.saveDocument({
      applicationId: application.id,
      documentTypeId: documentType.id,
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
