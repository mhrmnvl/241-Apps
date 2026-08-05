import { Injectable, NotFoundException } from '@nestjs/common';
import { IAchievementRepository } from '../domain/interfaces/achievement-repository.interface.js';
import { UpdateAchievementDto } from '../dto/request/update-achievement.dto.js';

@Injectable()
export class UpdateAchievementUseCase {
  constructor(private readonly achievementRepository: IAchievementRepository) {}

  async execute(id: string, dto: UpdateAchievementDto) {
    const existing = await this.achievementRepository.findById(id);
    if (!existing) throw new NotFoundException('Achievement not found');
    // `profileId` is absent from the update DTO on purpose: an achievement
    // cannot be moved to a different profile.
    return this.achievementRepository.update(id, {
      name: dto.name,
      level: dto.level,
      typeId: dto.typeId,
      year: dto.year,
      description: dto.description,
    });
  }
}
