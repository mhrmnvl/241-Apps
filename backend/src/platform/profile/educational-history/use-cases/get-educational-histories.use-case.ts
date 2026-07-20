import { Injectable } from '@nestjs/common';
import { EducationalHistoryRepository } from '../repositories/educational-history.repository.js';
import { EducationalHistoryQueryDto } from '../dto/request/educational-history-query.dto.js';

@Injectable()
export class GetEducationalHistoriesUseCase {
  constructor(private readonly repo: EducationalHistoryRepository) {}

  async execute(query: EducationalHistoryQueryDto) {
    return this.repo.findAll(query);
  }
}
