import { Injectable } from '@nestjs/common';
import { EducationalHistoryRepository } from '../repositories/educational-history.repository.js';
import { CreateEducationalHistoryDto } from '../dto/request/create-educational-history.dto.js';

@Injectable()
export class CreateEducationalHistoryUseCase {
  constructor(private readonly repository: EducationalHistoryRepository) {}

  async execute(dto: CreateEducationalHistoryDto) {
    return this.repository.create(dto);
  }
}
