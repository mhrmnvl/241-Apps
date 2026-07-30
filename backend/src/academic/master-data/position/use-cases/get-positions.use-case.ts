import { Injectable } from '@nestjs/common';
import { PositionQueryDto } from '../dto/request/position-query.dto.js';
import { IPositionRepository } from '../interfaces/position-repository.interface.js';

@Injectable()
export class GetPositionsUseCase {
  constructor(private readonly repository: IPositionRepository) {}

  async execute(query: PositionQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
