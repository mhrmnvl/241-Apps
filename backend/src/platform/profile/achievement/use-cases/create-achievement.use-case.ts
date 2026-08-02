import { Injectable } from '@nestjs/common';
import { IAchievementRepository } from '../domain/interfaces/achievement-repository.interface.js';
import { CreateAchievementDto } from '../dto/request/create-achievement.dto.js';

@Injectable()
export class CreateAchievementUseCase {
  constructor(private readonly achievementRepository: IAchievementRepository) {}

  async execute(dto: CreateAchievementDto) {
    return this.achievementRepository.create(dto);
  }
}
