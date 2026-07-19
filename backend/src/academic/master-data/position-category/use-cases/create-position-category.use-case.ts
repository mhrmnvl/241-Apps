import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreatePositionCategoryDto } from '../dto/create-position-category.dto.js';
import { IPositionCategoryRepository } from '../interfaces/position-category-repository.interface.js';

@Injectable()
export class CreatePositionCategoryUseCase {
  private readonly logger = new Logger(CreatePositionCategoryUseCase.name);

  constructor(private readonly repo: IPositionCategoryRepository) {}

  async execute(dto: CreatePositionCategoryDto) {
    const existing = await this.repo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(
        `Position category code "${dto.code}" already exists`,
      );
    }

    const category = await this.repo.create(dto);
    this.logger.log(`Position category created: ${category.code}`);
    return category;
  }
}
