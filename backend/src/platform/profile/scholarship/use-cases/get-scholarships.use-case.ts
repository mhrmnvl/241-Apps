import { Injectable } from '@nestjs/common';
import { IScholarshipRepository } from '../domain/interfaces/scholarship-repository.interface.js';
import { ScholarshipQueryDto } from '../dto/request/scholarship-query.dto.js';

@Injectable()
export class GetScholarshipsUseCase {
  constructor(private readonly scholarshipRepository: IScholarshipRepository) {}

  async execute(query: ScholarshipQueryDto) {
    return this.scholarshipRepository.findAll({
      page: query.page,
      limit: query.limit,
      profileId: query.profileId,
      status: query.status,
    });
  }
}
