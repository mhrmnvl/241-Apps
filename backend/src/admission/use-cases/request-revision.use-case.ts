import { Injectable, NotFoundException } from '@nestjs/common';
import { assertTransition } from '../domain/admission-status.transitions.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { RequestRevisionDto } from '../dto/request/request-revision.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class RequestRevisionUseCase {
  constructor(
    private readonly admissionApplicationRepository: IAdmissionApplicationRepository,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(applicationId: string, dto: RequestRevisionDto) {
    const application =
      await this.admissionApplicationRepository.findActiveById(applicationId);
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    assertTransition(application.status, 'REVISION_NEEDED');

    const updated = await this.admissionApplicationRepository.setRevisionNeeded(
      application.id,
      dto.note,
    );

    await this.notifications.notify(
      application.id,
      'STATUS_CHANGE',
      'Pendaftaran perlu revisi',
      `Pendaftaran Anda dikembalikan untuk diperbaiki. Catatan admin: ${dto.note}`,
    );

    return serializeApplicationDetail(updated);
  }
}
