import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from '../domain/interfaces/category-repository.interface.js';
import { CreateCategoryDto } from '../dto/request/create-category.dto.js';

@Injectable()
export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(dto: CreateCategoryDto) {
    return this.categoryRepository.create({
      code: dto.code,
      name: dto.name,
      depreciationRatePercent: dto.depreciationRatePercent,
    });
  }
}
