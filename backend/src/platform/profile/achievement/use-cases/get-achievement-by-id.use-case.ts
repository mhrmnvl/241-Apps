import { Injectable, NotFoundException } from '@nestjs/common';
import { IAchievementRepository } from '../domain/interfaces/achievement-repository.interface.js';

@Injectable()
export class GetAchievementByIdUseCase {
  constructor(private readonly achievementRepository: IAchievementRepository) {}

  async execute(id: string) {
    const achievement = await this.achievementRepository.findById(id);
    if (!achievement) throw new NotFoundException('Achievement not found');
    return achievement;
  }
}
