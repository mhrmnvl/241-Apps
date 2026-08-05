import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreatePositionCategoryDto } from '../dto/request/create-position-category.dto.js';
import { IPositionCategoryRepository } from '../domain/interfaces/position-category-repository.interface.js';

@Injectable()
export class CreatePositionCategoryUseCase {
  private readonly logger = new Logger(CreatePositionCategoryUseCase.name);

  constructor(
    private readonly positionCategoryRepository: IPositionCategoryRepository,
  ) {}

  async execute(dto: CreatePositionCategoryDto) {
    const existing = await this.positionCategoryRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(
        `Position category code "${dto.code}" already exists`,
      );
    }

    const category = await this.positionCategoryRepository.create({
      code: dto.code,
      name: dto.name,
    });
    this.logger.log(`Position category created: ${category.code}`);
    return category;
  }
}
