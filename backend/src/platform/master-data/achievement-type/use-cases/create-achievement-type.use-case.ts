import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateAchievementTypeDto } from '../dto/request/create-achievement-type.dto.js';
import { IAchievementTypeRepository } from '../domain/interfaces/achievement-type-repository.interface.js';

@Injectable()
export class CreateAchievementTypeUseCase {
  private readonly logger = new Logger(CreateAchievementTypeUseCase.name);

  constructor(
    private readonly achievementTypeRepository: IAchievementTypeRepository,
  ) {}

  async execute(dto: CreateAchievementTypeDto) {
    const existing = await this.achievementTypeRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        'AchievementType with name "' + dto.name + '" already exists',
      );
    }

    const item = await this.achievementTypeRepository.create({
      name: dto.name,
      isActive: dto.isActive,
    });

    this.logger.log(`AchievementType created: ${item.name}`);
    return item;
  }
}
