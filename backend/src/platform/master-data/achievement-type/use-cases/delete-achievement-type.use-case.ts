import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IAchievementTypeRepository } from '../domain/interfaces/achievement-type-repository.interface.js';

@Injectable()
export class DeleteAchievementTypeUseCase {
  private readonly logger = new Logger(DeleteAchievementTypeUseCase.name);

  constructor(private readonly repository: IAchievementTypeRepository) {}

  async execute(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('AchievementType with ID ${id} not found');
    }

    await this.repository.softDelete(id);
    this.logger.log(`AchievementType deleted: ${item.name}`);
  }
}
