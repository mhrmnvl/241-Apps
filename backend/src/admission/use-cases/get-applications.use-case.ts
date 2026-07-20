import { Injectable } from '@nestjs/common';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { AdmissionApplicationQueryDto } from '../dto/admission-query.dto.js';

@Injectable()
export class GetApplicationsUseCase {
  constructor(private readonly repository: IAdmissionApplicationRepository) {}

  async execute(query: AdmissionApplicationQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
