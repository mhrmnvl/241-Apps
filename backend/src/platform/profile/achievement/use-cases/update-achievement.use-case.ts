import { Injectable, NotFoundException } from '@nestjs/common';
import { IAchievementRepository } from '../domain/interfaces/achievement-repository.interface.js';
import { UpdateAchievementDto } from '../dto/request/update-achievement.dto.js';

@Injectable()
export class UpdateAchievementUseCase {
  constructor(private readonly achievementRepository: IAchievementRepository) {}

  async execute(id: string, dto: UpdateAchievementDto) {
    const existing = await this.achievementRepository.findById(id);
    if (!existing) throw new NotFoundException('Achievement not found');
    return this.achievementRepository.update(id, dto);
  }
}
