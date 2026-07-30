import { Injectable } from '@nestjs/common';
import { AchievementRepository } from '../repositories/achievement.repository.js';
import { AchievementQueryDto } from '../dto/request/achievement-query.dto.js';

@Injectable()
export class GetAchievementsUseCase {
  constructor(private readonly repository: AchievementRepository) {}

  async execute(query: AchievementQueryDto) {
    return this.repository.findAll(query);
  }
}
