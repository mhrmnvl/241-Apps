import { Injectable, NotFoundException } from '@nestjs/common';
import { IEducationalHistoryRepository } from '../domain/interfaces/educational-history-repository.interface.js';
import { UpdateEducationalHistoryDto } from '../dto/request/update-educational-history.dto.js';

@Injectable()
export class UpdateEducationalHistoryUseCase {
  constructor(
    private readonly educationalHistoryRepository: IEducationalHistoryRepository,
  ) {}

  async execute(id: string, dto: UpdateEducationalHistoryDto) {
    const existing = await this.educationalHistoryRepository.findById(id);
    if (!existing) throw new NotFoundException('Educational history not found');
    return this.educationalHistoryRepository.update(id, dto);
  }
}
