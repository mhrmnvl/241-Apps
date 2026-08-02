import { Injectable, NotFoundException } from '@nestjs/common';
import { IEducationalHistoryRepository } from '../domain/interfaces/educational-history-repository.interface.js';

@Injectable()
export class DeleteEducationalHistoryUseCase {
  constructor(
    private readonly educationalHistoryRepository: IEducationalHistoryRepository,
  ) {}

  async execute(id: string) {
    const existing = await this.educationalHistoryRepository.findById(id);
    if (!existing) throw new NotFoundException('Educational history not found');
    await this.educationalHistoryRepository.softDelete(id);
    return { message: 'Educational history deleted successfully' };
  }
}
