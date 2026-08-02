import { Injectable, NotFoundException } from '@nestjs/common';
import { IEducationalHistoryRepository } from '../domain/interfaces/educational-history-repository.interface.js';

@Injectable()
export class GetEducationalHistoryByIdUseCase {
  constructor(
    private readonly educationalHistoryRepository: IEducationalHistoryRepository,
  ) {}

  async execute(id: string) {
    const record = await this.educationalHistoryRepository.findById(id);
    if (!record) throw new NotFoundException('Educational history not found');
    return record;
  }
}
