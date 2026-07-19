import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from '../domain/interfaces/category-repository.interface.js';
import { CreateCategoryDto } from '../dto/category.dto.js';

@Injectable()
export class CreateCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(dto: CreateCategoryDto) {
    return this.repository.create({
      code: dto.code,
      name: dto.name,
      depreciationRatePercent: dto.depreciationRatePercent,
    });
  }
}
