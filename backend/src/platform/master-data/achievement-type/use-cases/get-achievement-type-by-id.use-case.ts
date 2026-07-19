import { Injectable, NotFoundException } from '@nestjs/common';
import { IAchievementTypeRepository } from '../domain/interfaces/achievement-type-repository.interface.js';

@Injectable()
export class GetAchievementTypeByIdUseCase {
  constructor(private readonly repository: IAchievementTypeRepository) {}

  async execute(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('AchievementType with ID ${id} not found');
    }
    return item;
  }
}
