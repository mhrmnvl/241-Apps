import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from '../domain/interfaces/category-repository.interface.js';

@Injectable()
export class GetCategoriesUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(search?: string) {
    return this.repository.findMany(search);
  }
}
