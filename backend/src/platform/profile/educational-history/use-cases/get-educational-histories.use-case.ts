import { Injectable } from '@nestjs/common';
import { IEducationalHistoryRepository } from '../domain/interfaces/educational-history-repository.interface.js';
import { EducationalHistoryQueryDto } from '../dto/request/educational-history-query.dto.js';

@Injectable()
export class GetEducationalHistoriesUseCase {
  constructor(
    private readonly educationalHistoryRepository: IEducationalHistoryRepository,
  ) {}

  async execute(query: EducationalHistoryQueryDto) {
    return this.educationalHistoryRepository.findAll({
      page: query.page,
      limit: query.limit,
      profileId: query.profileId,
      level: query.level,
      status: query.status,
    });
  }
}
