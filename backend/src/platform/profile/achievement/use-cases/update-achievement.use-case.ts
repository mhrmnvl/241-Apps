import { Injectable, NotFoundException } from '@nestjs/common';
import { AchievementRepository } from '../repositories/achievement.repository.js';
import { UpdateAchievementDto } from '../dto/request/update-achievement.dto.js';

@Injectable()
export class UpdateAchievementUseCase {
  constructor(private readonly repository: AchievementRepository) {}

  async execute(id: string, dto: UpdateAchievementDto) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Achievement not found');
    return this.repository.update(id, dto);
  }
}
