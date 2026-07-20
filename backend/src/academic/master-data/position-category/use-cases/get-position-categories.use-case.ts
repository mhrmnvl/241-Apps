import { Injectable } from '@nestjs/common';
import { PositionCategoryQueryDto } from '../dto/request/position-category-query.dto.js';
import { IPositionCategoryRepository } from '../interfaces/position-category-repository.interface.js';

@Injectable()
export class GetPositionCategoriesUseCase {
  constructor(private readonly repo: IPositionCategoryRepository) {}

  async execute(query: PositionCategoryQueryDto) {
    return this.repo.findAll(query);
  }
}
