import { Injectable } from '@nestjs/common';
import { PositionCategoryQueryDto } from '../dto/request/position-category-query.dto.js';
import { IPositionCategoryRepository } from '../domain/interfaces/position-category-repository.interface.js';

@Injectable()
export class GetPositionCategoriesUseCase {
  constructor(
    private readonly positionCategoryRepository: IPositionCategoryRepository,
  ) {}

  async execute(query: PositionCategoryQueryDto) {
    return this.positionCategoryRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }
}
