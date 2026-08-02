import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IPositionCategoryRepository } from '../domain/interfaces/position-category-repository.interface.js';

@Injectable()
export class DeletePositionCategoryUseCase {
  private readonly logger = new Logger(DeletePositionCategoryUseCase.name);

  constructor(
    private readonly positionCategoryRepository: IPositionCategoryRepository,
  ) {}

  async execute(id: string) {
    const existing = await this.positionCategoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Position category with ID ${id} not found`);
    }

    const inUseCount =
      await this.positionCategoryRepository.countPositionsWithCategory(id);
    if (inUseCount > 0) {
      throw new ConflictException(
        `Position category is in use by ${inUseCount} positions and cannot be deleted`,
      );
    }

    await this.positionCategoryRepository.remove(id);
    this.logger.log(`Position category deleted: ${id}`);
  }
}
