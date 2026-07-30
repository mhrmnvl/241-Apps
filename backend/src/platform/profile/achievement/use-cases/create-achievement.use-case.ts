import { Injectable } from '@nestjs/common';
import { AchievementRepository } from '../repositories/achievement.repository.js';
import { CreateAchievementDto } from '../dto/request/create-achievement.dto.js';

@Injectable()
export class CreateAchievementUseCase {
  constructor(private readonly repository: AchievementRepository) {}

  async execute(dto: CreateAchievementDto) {
    return this.repository.create(dto);
  }
}
