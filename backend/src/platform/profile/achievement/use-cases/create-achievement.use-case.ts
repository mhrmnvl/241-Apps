import { Injectable } from '@nestjs/common';
import { AchievementRepository } from '../repositories/achievement.repository.js';
import { CreateAchievementDto } from '../dto/create-achievement.dto.js';

@Injectable()
export class CreateAchievementUseCase {
  constructor(private readonly repo: AchievementRepository) {}

  async execute(dto: CreateAchievementDto) {
    return this.repo.create(dto);
  }
}
