import { Injectable, NotFoundException } from '@nestjs/common';
import { EducationalHistoryRepository } from '../repositories/educational-history.repository.js';

@Injectable()
export class DeleteEducationalHistoryUseCase {
  constructor(private readonly repository: EducationalHistoryRepository) {}

  async execute(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Educational history not found');
    await this.repository.softDelete(id);
    return { message: 'Educational history deleted successfully' };
  }
}
