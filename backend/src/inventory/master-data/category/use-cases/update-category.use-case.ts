import { Injectable, NotFoundException } from '@nestjs/common';
import { ICategoryRepository } from '../domain/interfaces/category-repository.interface.js';
import { UpdateCategoryDto } from '../dto/request/update-category.dto.js';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(id: string, dto: UpdateCategoryDto) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return this.repository.update(id, {
      code: dto.code,
      name: dto.name,
      depreciationRatePercent: dto.depreciationRatePercent,
    });
  }
}
