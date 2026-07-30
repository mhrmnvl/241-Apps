import { Injectable, NotFoundException } from '@nestjs/common';
import { IPositionCategoryRepository } from '../interfaces/position-category-repository.interface.js';

@Injectable()
export class GetPositionCategoryByIdUseCase {
  constructor(private readonly repository: IPositionCategoryRepository) {}

  async execute(id: string) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundException(`Position category with ID ${id} not found`);
    }
    return category;
  }
}
