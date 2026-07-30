import { Injectable, NotFoundException } from '@nestjs/common';
import { AchievementRepository } from '../repositories/achievement.repository.js';

@Injectable()
export class DeleteAchievementUseCase {
  constructor(private readonly repository: AchievementRepository) {}

  async execute(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Achievement not found');
    await this.repository.softDelete(id);
    return { message: 'Achievement deleted successfully' };
  }
}
