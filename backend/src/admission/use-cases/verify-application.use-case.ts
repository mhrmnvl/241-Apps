import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { assertTransition } from '../domain/admission-status.transitions.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class VerifyApplicationUseCase {
  constructor(
    private readonly admissionApplicationRepository: IAdmissionApplicationRepository,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(applicationId: string, adminId: string) {
    const application =
      await this.admissionApplicationRepository.findActiveWithDocsAndPayment(
        applicationId,
      );
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    assertTransition(application.status, 'VERIFIED');

    const requiredTypes =
      await this.admissionApplicationRepository.findRequiredActiveDocumentTypes();
    const unapproved = requiredTypes.filter((type) => {
      const doc = (application.documents ?? []).find(
        (d) => d.documentTypeId === type.id,
      );
      return doc?.status !== 'APPROVED';
    });
    if (unapproved.length > 0) {
      throw new ConflictException(
        `All required documents must be approved first: ${unapproved
          .map((t) => t.name)
          .join(', ')}`,
      );
    }

    if (application.payment?.status !== 'VERIFIED') {
      throw new ConflictException('The payment must be verified first');
    }

    const updated = await this.admissionApplicationRepository.setVerified(
      application.id,
      adminId,
    );

    await this.notifications.notify(
      application.id,
      'STATUS_CHANGE',
      'Berkas terverifikasi',
      'Seluruh berkas dan pembayaran Anda telah diverifikasi. Menunggu keputusan penerimaan.',
    );

    return serializeApplicationDetail(updated);
  }
}
