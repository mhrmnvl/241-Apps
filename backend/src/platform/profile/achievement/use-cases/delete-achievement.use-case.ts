import { Injectable, NotFoundException } from '@nestjs/common';
import { AchievementRepository } from '../repositories/achievement.repository.js';

@Injectable()
export class DeleteAchievementUseCase {
  constructor(private readonly repo: AchievementRepository) {}

  async execute(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Achievement not found');
    await this.repo.softDelete(id);
    return { message: 'Achievement deleted successfully' };
  }
}
