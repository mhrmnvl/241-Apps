import { Injectable } from '@nestjs/common';
import { ICirculationRepository } from '../domain/interfaces/circulation-repository.interface.js';
import { HistoryQueryDto } from '../dto/request/history-query.dto.js';

@Injectable()
export class GetHistoriesUseCase {
  constructor(private readonly circulationRepository: ICirculationRepository) {}

  async execute(query: HistoryQueryDto) {
    return this.circulationRepository.findAllHistories({
      page: query.page,
      limit: query.limit,
      unitId: query.unitId,
    });
  }
}
