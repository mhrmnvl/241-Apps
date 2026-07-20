import { Injectable, NotFoundException } from '@nestjs/common';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';

@Injectable()
export class GetApplicationByIdUseCase {
  constructor(private readonly repository: IAdmissionApplicationRepository) {}

  async execute(id: string) {
    const application = await this.repository.findAdminDetailById(id);
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    // Duplicate-NIK warning for admins (NIK is intentionally not unique here).
    const duplicateNikCount = application.nik
      ? await this.repository.countByNik(application.nik, application.id)
      : 0;

    const documentTypes = await this.repository.findActiveDocumentTypes();

    return {
      ...serializeApplicationDetail(application),
      duplicateNikCount,
      documentTypes,
    };
  }
}
