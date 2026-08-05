import { Injectable } from '@nestjs/common';
import { serializeWave } from '../domain/admission.serializers.js';
import { IAdmissionWaveRepository } from '../domain/interfaces/admission-wave-repository.interface.js';
import { AdmissionWaveQueryDto } from '../dto/request/admission-wave-query.dto.js';

@Injectable()
export class GetAdmissionWavesUseCase {
  constructor(
    private readonly admissionWaveRepository: IAdmissionWaveRepository,
  ) {}

  async execute(query: AdmissionWaveQueryDto) {
    const { data, total, page, limit } =
      await this.admissionWaveRepository.findAll({
        page: query.page,
        limit: query.limit,
        search: query.search,
        academicYearId: query.academicYearId,
        isActive: query.isActive,
      });

    return {
      data: data.map(serializeWave),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
