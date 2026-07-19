import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';
import { VerifyDocumentDto } from '../dto/admin-actions.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class VerifyDocumentUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(
    applicationId: string,
    documentId: string,
    dto: VerifyDocumentDto,
    adminId: string,
  ) {
    if (dto.status === 'REJECTED' && !dto.note?.trim()) {
      throw new BadRequestException('Alasan penolakan berkas wajib diisi');
    }

    const document = await this.prisma.admissionDocument.findFirst({
      where: { id: documentId, applicationId },
      include: { documentType: true },
    });
    if (!document) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.admissionDocument.update({
        where: { id: document.id },
        data: {
          status: dto.status,
          note: dto.note ?? null,
          verifiedById: adminId,
          verifiedAt: new Date(),
        },
        include: { documentType: true, file: true },
      });

      await this.notifications.notify(
        applicationId,
        'DOCUMENT',
        dto.status === 'APPROVED'
          ? `Berkas ${document.documentType.name} disetujui`
          : `Berkas ${document.documentType.name} ditolak`,
        dto.status === 'APPROVED'
          ? `Berkas ${document.documentType.name} Anda telah diverifikasi dan disetujui.`
          : `Berkas ${document.documentType.name} Anda ditolak. Catatan: ${dto.note}. Silakan unggah ulang.`,
        tx,
      );

      return updated;
    });
  }
}
