import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdatePositionCategoryDto } from '../dto/request/update-position-category.dto.js';
import { IPositionCategoryRepository } from '../domain/interfaces/position-category-repository.interface.js';

@Injectable()
export class UpdatePositionCategoryUseCase {
  private readonly logger = new Logger(UpdatePositionCategoryUseCase.name);

  constructor(
    private readonly positionCategoryRepository: IPositionCategoryRepository,
  ) {}

  async execute(id: string, dto: UpdatePositionCategoryDto) {
    const existing = await this.positionCategoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Position category with ID ${id} not found`);
    }

    const category = await this.positionCategoryRepository.update(id, {
      name: dto.name,
    });
    this.logger.log(`Position category updated: ${id}`);
    return category;
  }
}
