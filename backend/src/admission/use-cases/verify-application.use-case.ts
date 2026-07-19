import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';
import { assertTransition } from '../domain/admission-status.transitions.js';
import { applicationDetailInclude } from '../domain/admission.includes.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class VerifyApplicationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(applicationId: string, adminId: string) {
    const application = await this.prisma.admissionApplication.findFirst({
      where: { id: applicationId, deletedAt: null },
      include: { documents: true, payment: true },
    });
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    assertTransition(application.status, 'VERIFIED');

    const requiredTypes = await this.prisma.admissionDocumentType.findMany({
      where: { isActive: true, isRequired: true },
    });
    const unapproved = requiredTypes.filter((type) => {
      const doc = application.documents.find(
        (d) => d.documentTypeId === type.id,
      );
      return doc?.status !== 'APPROVED';
    });
    if (unapproved.length > 0) {
      throw new ConflictException(
        `Semua berkas wajib harus disetujui dahulu: ${unapproved
          .map((t) => t.name)
          .join(', ')}`,
      );
    }

    if (application.payment?.status !== 'VERIFIED') {
      throw new ConflictException(
        'Pembayaran harus diverifikasi terlebih dahulu',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.admissionApplication.update({
        where: { id: application.id },
        data: {
          status: 'VERIFIED',
          verifiedById: adminId,
          verifiedAt: new Date(),
        },
        include: applicationDetailInclude,
      });

      await this.notifications.notify(
        application.id,
        'STATUS_CHANGE',
        'Berkas terverifikasi',
        'Seluruh berkas dan pembayaran Anda telah diverifikasi. Menunggu keputusan penerimaan.',
        tx,
      );

      return serializeApplicationDetail(updated);
    });
  }
}
