import { Injectable, NotFoundException } from '@nestjs/common';
import { EducationalHistoryRepository } from '../repositories/educational-history.repository.js';
import { UpdateEducationalHistoryDto } from '../dto/request/update-educational-history.dto.js';

@Injectable()
export class UpdateEducationalHistoryUseCase {
  constructor(private readonly repository: EducationalHistoryRepository) {}

  async execute(id: string, dto: UpdateEducationalHistoryDto) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Educational history not found');
    return this.repository.update(id, dto);
  }
}
