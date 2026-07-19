import { Injectable, NotFoundException } from '@nestjs/common';
import { EducationalHistoryRepository } from '../repositories/educational-history.repository.js';

@Injectable()
export class GetEducationalHistoryByIdUseCase {
  constructor(private readonly repo: EducationalHistoryRepository) {}

  async execute(id: string) {
    const record = await this.repo.findById(id);
    if (!record) throw new NotFoundException('Educational history not found');
    return record;
  }
}
