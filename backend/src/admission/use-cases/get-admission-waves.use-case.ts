import { Injectable } from '@nestjs/common';
import { serializeWave } from '../domain/admission.serializers.js';
import { IAdmissionWaveRepository } from '../domain/interfaces/admission-wave-repository.interface.js';
import { AdmissionWaveQueryDto } from '../dto/request/admission-wave-query.dto.js';

@Injectable()
export class GetAdmissionWavesUseCase {
  constructor(private readonly repository: IAdmissionWaveRepository) {}

  async execute(query: AdmissionWaveQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);

    return {
      data: data.map(serializeWave),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
