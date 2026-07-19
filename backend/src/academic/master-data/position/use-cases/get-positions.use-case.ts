import { Injectable } from '@nestjs/common';
import { PositionQueryDto } from '../dto/position-query.dto.js';
import { IPositionRepository } from '../interfaces/position-repository.interface.js';

@Injectable()
export class GetPositionsUseCase {
  constructor(private readonly repo: IPositionRepository) {}

  async execute(query: PositionQueryDto) {
    const { data, total, page, limit } = await this.repo.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
