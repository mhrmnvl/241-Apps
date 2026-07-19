import { Injectable, NotFoundException } from '@nestjs/common';
import { AchievementRepository } from '../repositories/achievement.repository.js';
import { UpdateAchievementDto } from '../dto/update-achievement.dto.js';

@Injectable()
export class UpdateAchievementUseCase {
  constructor(private readonly repo: AchievementRepository) {}

  async execute(id: string, dto: UpdateAchievementDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Achievement not found');
    return this.repo.update(id, dto);
  }
}
