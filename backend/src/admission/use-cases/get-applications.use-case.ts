import { Injectable } from '@nestjs/common';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { AdmissionApplicationQueryDto } from '../dto/request/admission-query.dto.js';

@Injectable()
export class GetApplicationsUseCase {
  constructor(
    private readonly admissionApplicationRepository: IAdmissionApplicationRepository,
  ) {}

  async execute(query: AdmissionApplicationQueryDto) {
    const { data, total, page, limit } =
      await this.admissionApplicationRepository.findAll({
        page: query.page,
        limit: query.limit,
        search: query.search,
        status: query.status,
        waveId: query.waveId,
      });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
