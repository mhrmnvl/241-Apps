import { Injectable, NotFoundException } from '@nestjs/common';
import { IAchievementRepository } from '../domain/interfaces/achievement-repository.interface.js';

@Injectable()
export class DeleteAchievementUseCase {
  constructor(private readonly achievementRepository: IAchievementRepository) {}

  async execute(id: string) {
    const existing = await this.achievementRepository.findById(id);
    if (!existing) throw new NotFoundException('Achievement not found');
    await this.achievementRepository.softDelete(id);
    return { message: 'Achievement deleted successfully' };
  }
}
