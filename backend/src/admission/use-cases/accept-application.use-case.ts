import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';
import { assertTransition } from '../domain/admission-status.transitions.js';
import { applicationDetailInclude } from '../domain/admission.includes.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import { AcceptApplicationDto } from '../dto/admin-actions.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class AcceptApplicationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(
    applicationId: string,
    dto: AcceptApplicationDto,
    adminId: string,
  ) {
    const application = await this.prisma.admissionApplication.findFirst({
      where: { id: applicationId, deletedAt: null },
      include: { wave: true },
    });
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    assertTransition(application.status, 'ACCEPTED');

    // Soft quota check: warn, don't block.
    const acceptedCount = await this.prisma.admissionApplication.count({
      where: {
        waveId: application.waveId,
        status: { in: ['ACCEPTED', 'ENROLLED'] },
        deletedAt: null,
      },
    });
    const quotaWarning =
      acceptedCount >= application.wave.quota
        ? `Kuota gelombang (${application.wave.quota}) sudah terpenuhi — penerimaan ini melebihi kuota.`
        : null;

    const updated = await this.prisma.$transaction(async (tx) => {
      const app = await tx.admissionApplication.update({
        where: { id: application.id },
        data: {
          status: 'ACCEPTED',
          decidedById: adminId,
          decidedAt: new Date(),
          decisionNote: dto.note ?? null,
        },
        include: applicationDetailInclude,
      });

      await this.notifications.notify(
        application.id,
        'STATUS_CHANGE',
        'Selamat, Anda diterima! 🎉',
        `Selamat! Anda dinyatakan DITERIMA sebagai calon santri baru.${dto.note ? ` Catatan: ${dto.note}` : ''} Silakan tunggu informasi daftar ulang.`,
        tx,
      );

      return app;
    });

    return { ...serializeApplicationDetail(updated), quotaWarning };
  }
}
