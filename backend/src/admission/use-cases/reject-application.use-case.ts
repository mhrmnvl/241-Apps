import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';
import { assertTransition } from '../domain/admission-status.transitions.js';
import { applicationDetailInclude } from '../domain/admission.includes.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import { RejectApplicationDto } from '../dto/admin-actions.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class RejectApplicationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(
    applicationId: string,
    dto: RejectApplicationDto,
    adminId: string,
  ) {
    const application = await this.prisma.admissionApplication.findFirst({
      where: { id: applicationId, deletedAt: null },
    });
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    assertTransition(application.status, 'REJECTED');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.admissionApplication.update({
        where: { id: application.id },
        data: {
          status: 'REJECTED',
          decidedById: adminId,
          decidedAt: new Date(),
          decisionNote: dto.reason,
        },
        include: applicationDetailInclude,
      });

      await this.notifications.notify(
        application.id,
        'STATUS_CHANGE',
        'Hasil seleksi pendaftaran',
        `Mohon maaf, pendaftaran Anda belum dapat kami terima. Alasan: ${dto.reason}`,
        tx,
      );

      return serializeApplicationDetail(updated);
    });
  }
}
