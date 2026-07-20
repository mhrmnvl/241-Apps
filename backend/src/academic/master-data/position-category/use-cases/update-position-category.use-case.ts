import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdatePositionCategoryDto } from '../dto/request/create-position-category.dto.js';
import { IPositionCategoryRepository } from '../interfaces/position-category-repository.interface.js';

@Injectable()
export class UpdatePositionCategoryUseCase {
  private readonly logger = new Logger(UpdatePositionCategoryUseCase.name);

  constructor(private readonly repo: IPositionCategoryRepository) {}

  async execute(id: string, dto: UpdatePositionCategoryDto) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Position category with ID ${id} not found`);
    }

    const category = await this.repo.update(id, dto);
    this.logger.log(`Position category updated: ${id}`);
    return category;
  }
}
