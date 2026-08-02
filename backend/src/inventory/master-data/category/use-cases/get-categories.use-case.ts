import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from '../domain/interfaces/category-repository.interface.js';

@Injectable()
export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(search?: string) {
    return this.categoryRepository.findMany(search);
  }
}
