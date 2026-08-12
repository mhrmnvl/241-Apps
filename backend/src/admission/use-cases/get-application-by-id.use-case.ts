import { Injectable, NotFoundException } from '@nestjs/common';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';

@Injectable()
export class GetApplicationByIdUseCase {
  constructor(
    private readonly admissionApplicationRepository: IAdmissionApplicationRepository,
  ) {}

  async execute(id: string) {
    const application =
      await this.admissionApplicationRepository.findAdminDetailById(id);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Duplicate-NIK warning for admins (NIK is intentionally not unique here).
    const duplicateNikCount = application.nik
      ? await this.admissionApplicationRepository.countByNik(
          application.nik,
          application.id,
        )
      : 0;

    const documentTypes =
      await this.admissionApplicationRepository.findActiveDocumentTypes();

    return {
      ...serializeApplicationDetail(application),
      duplicateNikCount,
      documentTypes,
    };
  }
}
