import { Injectable, NotFoundException } from '@nestjs/common';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';

@Injectable()
export class GetMyNotificationsUseCase {
  constructor(
    private readonly admissionApplicantRepository: IAdmissionApplicantRepository,
  ) {}

  async execute(userId: string) {
    const applicationId =
      await this.admissionApplicantRepository.findApplicationIdByUser(userId);
    if (!applicationId) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    return this.admissionApplicantRepository.findNotifications(applicationId);
  }
}
