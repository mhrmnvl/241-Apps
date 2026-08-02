import { AdmissionDocumentStatus } from '../../shared/domain/enums/admission-document-status.enum.js';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { VerifyDocumentDto } from '../dto/request/admin-actions.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class VerifyDocumentUseCase {
  constructor(
    private readonly admissionApplicationRepository: IAdmissionApplicationRepository,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(
    applicationId: string,
    documentId: string,
    dto: VerifyDocumentDto,
    adminId: string,
  ) {
    if (dto.status === AdmissionDocumentStatus.REJECTED && !dto.note?.trim()) {
      throw new BadRequestException('Alasan penolakan berkas wajib diisi');
    }

    const document = await this.admissionApplicationRepository.findDocument(
      applicationId,
      documentId,
    );
    if (!document) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    const updated =
      await this.admissionApplicationRepository.updateDocumentStatus(
        document.id,
        {
          status: dto.status,
          note: dto.note ?? null,
          adminId,
        },
      );

    await this.notifications.notify(
      applicationId,
      'DOCUMENT',
      dto.status === AdmissionDocumentStatus.APPROVED
        ? `Berkas ${document.documentType.name} disetujui`
        : `Berkas ${document.documentType.name} ditolak`,
      dto.status === AdmissionDocumentStatus.APPROVED
        ? `Berkas ${document.documentType.name} Anda telah diverifikasi dan disetujui.`
        : `Berkas ${document.documentType.name} Anda ditolak. Catatan: ${dto.note}. Silakan unggah ulang.`,
    );

    return updated;
  }
}
