import { Injectable } from '@nestjs/common';
import { IAchievementRepository } from '../domain/interfaces/achievement-repository.interface.js';
import { AchievementQueryDto } from '../dto/request/achievement-query.dto.js';

@Injectable()
export class GetAchievementsUseCase {
  constructor(private readonly achievementRepository: IAchievementRepository) {}

  async execute(query: AchievementQueryDto) {
    return this.achievementRepository.findAll(query);
  }
}
