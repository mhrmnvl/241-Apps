import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IPositionCategoryRepository } from '../interfaces/position-category-repository.interface.js';

@Injectable()
export class DeletePositionCategoryUseCase {
  private readonly logger = new Logger(DeletePositionCategoryUseCase.name);

  constructor(private readonly repo: IPositionCategoryRepository) {}

  async execute(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Position category with ID ${id} not found`);
    }

    const inUseCount = await this.repo.countPositionsWithCategory(id);
    if (inUseCount > 0) {
      throw new ConflictException(
        `Position category is in use by ${inUseCount} positions and cannot be deleted`,
      );
    }

    await this.repo.remove(id);
    this.logger.log(`Position category deleted: ${id}`);
  }
}
