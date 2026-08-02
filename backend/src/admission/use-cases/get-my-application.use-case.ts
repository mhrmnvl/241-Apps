import { Injectable, NotFoundException } from '@nestjs/common';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';

@Injectable()
export class GetMyApplicationUseCase {
  constructor(
    private readonly admissionApplicantRepository: IAdmissionApplicantRepository,
  ) {}

  async execute(userId: string) {
    const application =
      await this.admissionApplicantRepository.findMyDetail(userId);
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    const documentTypes =
      await this.admissionApplicantRepository.findActiveDocumentTypes();

    return { ...serializeApplicationDetail(application), documentTypes };
  }
}
