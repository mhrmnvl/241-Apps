import { Injectable, NotFoundException } from '@nestjs/common';
import { ICategoryRepository } from '../domain/interfaces/category-repository.interface.js';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(id: string) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return this.repository.delete(id);
  }
}
