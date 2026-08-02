import { Injectable } from '@nestjs/common';
import { IEducationalHistoryRepository } from '../domain/interfaces/educational-history-repository.interface.js';
import { CreateEducationalHistoryDto } from '../dto/request/create-educational-history.dto.js';

@Injectable()
export class CreateEducationalHistoryUseCase {
  constructor(
    private readonly educationalHistoryRepository: IEducationalHistoryRepository,
  ) {}

  async execute(dto: CreateEducationalHistoryDto) {
    return this.educationalHistoryRepository.create(dto);
  }
}
