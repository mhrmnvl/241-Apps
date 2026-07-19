import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';
import { assertTransition } from '../domain/admission-status.transitions.js';
import { applicationDetailInclude } from '../domain/admission.includes.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import { RequestRevisionDto } from '../dto/admin-actions.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class RequestRevisionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(applicationId: string, dto: RequestRevisionDto) {
    const application = await this.prisma.admissionApplication.findFirst({
      where: { id: applicationId, deletedAt: null },
    });
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    assertTransition(application.status, 'REVISION_NEEDED');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.admissionApplication.update({
        where: { id: application.id },
        data: { status: 'REVISION_NEEDED', revisionNote: dto.note },
        include: applicationDetailInclude,
      });

      await this.notifications.notify(
        application.id,
        'STATUS_CHANGE',
        'Pendaftaran perlu revisi',
        `Pendaftaran Anda dikembalikan untuk diperbaiki. Catatan admin: ${dto.note}`,
        tx,
      );

      return serializeApplicationDetail(updated);
    });
  }
}
