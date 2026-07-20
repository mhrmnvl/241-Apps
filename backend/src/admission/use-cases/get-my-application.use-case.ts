import { Injectable, NotFoundException } from '@nestjs/common';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';

@Injectable()
export class GetMyApplicationUseCase {
  constructor(private readonly repository: IAdmissionApplicantRepository) {}

  async execute(userId: string) {
    const application = await this.repository.findMyDetail(userId);
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    const documentTypes = await this.repository.findActiveDocumentTypes();

    return { ...serializeApplicationDetail(application), documentTypes };
  }
}
