import { Injectable } from '@nestjs/common';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';

@Injectable()
export class GetActiveWavesUseCase {
  constructor(private readonly repository: IAdmissionApplicantRepository) {}

  async execute() {
    const [waves, documentTypes] = await Promise.all([
      this.repository.findActiveWaves(),
      this.repository.findActiveDocumentTypes(),
    ]);

    return {
      waves: waves.map((w) => ({
        id: w.id,
        name: w.name,
        code: w.code,
        academicYear: w.academicYear.name,
        startDate: w.startDate,
        endDate: w.endDate,
        quota: w.quota,
        remainingQuota: Math.max(w.quota - w._count.applications, 0),
        registrationFee: Number(w.registrationFee),
        description: w.description,
      })),
      documentTypes,
    };
  }
}
