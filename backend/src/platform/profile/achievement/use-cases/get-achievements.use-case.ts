import { Injectable } from '@nestjs/common';
import { AchievementRepository } from '../repositories/achievement.repository.js';
import { AchievementQueryDto } from '../dto/achievement-query.dto.js';

@Injectable()
export class GetAchievementsUseCase {
  constructor(private readonly repo: AchievementRepository) {}

  async execute(query: AchievementQueryDto) {
    return this.repo.findAll(query);
  }
}
