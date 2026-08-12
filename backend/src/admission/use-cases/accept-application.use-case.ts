import { Injectable, NotFoundException } from '@nestjs/common';
import { assertTransition } from '../domain/admission-status.transitions.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { AcceptApplicationDto } from '../dto/request/accept-application.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class AcceptApplicationUseCase {
  constructor(
    private readonly admissionApplicationRepository: IAdmissionApplicationRepository,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(
    applicationId: string,
    dto: AcceptApplicationDto,
    adminId: string,
  ) {
    const application =
      await this.admissionApplicationRepository.findActiveWithWave(
        applicationId,
      );
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    assertTransition(application.status, 'ACCEPTED');

    // Soft quota check: warn, don't block.
    const acceptedCount =
      await this.admissionApplicationRepository.countAcceptedInWave(
        application.waveId,
      );
    const quotaWarning =
      acceptedCount >= application.wave.quota
        ? `Wave quota (${application.wave.quota}) is already met; this acceptance exceeds it.`
        : null;

    const updated = await this.admissionApplicationRepository.setAccepted({
      id: application.id,
      adminId,
      note: dto.note ?? null,
    });

    await this.notifications.notify(
      application.id,
      'STATUS_CHANGE',
      'Selamat, Anda diterima! 🎉',
      `Selamat! Anda dinyatakan DITERIMA sebagai calon santri baru.${dto.note ? ` Catatan: ${dto.note}` : ''} Silakan tunggu informasi daftar ulang.`,
    );

    return { ...serializeApplicationDetail(updated), quotaWarning };
  }
}
