import { Injectable } from '@nestjs/common';
import { EducationalHistoryRepository } from '../repositories/educational-history.repository.js';
import { CreateEducationalHistoryDto } from '../dto/create-educational-history.dto.js';

@Injectable()
export class CreateEducationalHistoryUseCase {
  constructor(private readonly repo: EducationalHistoryRepository) {}

  async execute(dto: CreateEducationalHistoryDto) {
    return this.repo.create(dto);
  }
}
