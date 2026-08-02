import { Injectable, NotFoundException } from '@nestjs/common';
import { IPositionCategoryRepository } from '../domain/interfaces/position-category-repository.interface.js';

@Injectable()
export class GetPositionCategoryByIdUseCase {
  constructor(
    private readonly positionCategoryRepository: IPositionCategoryRepository,
  ) {}

  async execute(id: string) {
    const category = await this.positionCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Position category with ID ${id} not found`);
    }
    return category;
  }
}
