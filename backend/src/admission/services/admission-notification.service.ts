import { Injectable } from '@nestjs/common';
import { AdmissionNotificationType } from '../../shared/domain/enums/admission-notification-type.enum.js';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';

/**
 * Writes in-app notifications for admission workflow transitions.
 * Extension point: add email/WA channels here (single call site for all
 * transitions) via platform NotificationModule.
 */
@Injectable()
export class AdmissionNotificationService {
  constructor(
    private readonly applicantRepository: IAdmissionApplicantRepository,
  ) {}

  async notify(
    applicationId: string,
    type: `${AdmissionNotificationType}`,
    title: string,
    message: string,
  ): Promise<void> {
    await this.applicantRepository.createNotification({
      applicationId,
      type,
      title,
      message,
    });
  }
}
