import { Injectable, NotFoundException } from '@nestjs/common';
import { ICategoryRepository } from '../domain/interfaces/category-repository.interface.js';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return this.categoryRepository.delete(id);
  }
}
