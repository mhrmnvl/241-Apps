import { Injectable, NotFoundException } from '@nestjs/common';
import { AchievementRepository } from '../repositories/achievement.repository.js';

@Injectable()
export class GetAchievementByIdUseCase {
  constructor(private readonly repo: AchievementRepository) {}

  async execute(id: string) {
    const achievement = await this.repo.findById(id);
    if (!achievement) throw new NotFoundException('Achievement not found');
    return achievement;
  }
}
