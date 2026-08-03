import { Injectable, NotFoundException } from '@nestjs/common';
import { assertTransition } from '../domain/admission-status.transitions.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { RejectApplicationDto } from '../dto/request/reject-application.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class RejectApplicationUseCase {
  constructor(
    private readonly admissionApplicationRepository: IAdmissionApplicationRepository,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(
    applicationId: string,
    dto: RejectApplicationDto,
    adminId: string,
  ) {
    const application =
      await this.admissionApplicationRepository.findActiveById(applicationId);
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    assertTransition(application.status, 'REJECTED');

    const updated = await this.admissionApplicationRepository.setRejected({
      id: application.id,
      adminId,
      reason: dto.reason,
    });

    await this.notifications.notify(
      application.id,
      'STATUS_CHANGE',
      'Hasil seleksi pendaftaran',
      `Mohon maaf, pendaftaran Anda belum dapat kami terima. Alasan: ${dto.reason}`,
    );

    return serializeApplicationDetail(updated);
  }
}
