import { Injectable } from '@nestjs/common';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';

@Injectable()
export class GetAdmissionStatsUseCase {
  constructor(private readonly repository: IAdmissionApplicationRepository) {}

  async execute(waveId?: string) {
    const [statusCounts, waves] = await Promise.all([
      this.repository.getStatusCounts(waveId),
      this.repository.getWavesWithAcceptedCount(waveId),
    ]);

    const byStatus = Object.fromEntries(
      statusCounts.map((s) => [s.status, s.count]),
    );
    const total = statusCounts.reduce((sum, s) => sum + s.count, 0);

    return {
      total,
      byStatus,
      waves: waves.map((w) => ({
        id: w.id,
        name: w.name,
        code: w.code,
        quota: w.quota,
        accepted: w.accepted,
        quotaFillRate: w.quota > 0 ? w.accepted / w.quota : 0,
      })),
    };
  }
}
