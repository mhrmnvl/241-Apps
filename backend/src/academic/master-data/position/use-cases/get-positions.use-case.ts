import { Injectable } from '@nestjs/common';
import { PositionQueryDto } from '../dto/request/position-query.dto.js';
import { IPositionRepository } from '../domain/interfaces/position-repository.interface.js';

@Injectable()
export class GetPositionsUseCase {
  constructor(private readonly positionRepository: IPositionRepository) {}

  async execute(query: PositionQueryDto) {
    const { data, total, page, limit } = await this.positionRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      categoryId: query.categoryId,
      isActive: query.isActive,
    });
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
