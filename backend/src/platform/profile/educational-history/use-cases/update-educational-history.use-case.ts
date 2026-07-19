import { Injectable, NotFoundException } from '@nestjs/common';
import { EducationalHistoryRepository } from '../repositories/educational-history.repository.js';
import { UpdateEducationalHistoryDto } from '../dto/update-educational-history.dto.js';

@Injectable()
export class UpdateEducationalHistoryUseCase {
  constructor(private readonly repo: EducationalHistoryRepository) {}

  async execute(id: string, dto: UpdateEducationalHistoryDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Educational history not found');
    return this.repo.update(id, dto);
  }
}
