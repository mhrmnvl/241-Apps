import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateAchievementTypeDto } from '../dto/create-achievement-type.dto.js';
import { IAchievementTypeRepository } from '../domain/interfaces/achievement-type-repository.interface.js';

@Injectable()
export class CreateAchievementTypeUseCase {
  private readonly logger = new Logger(CreateAchievementTypeUseCase.name);

  constructor(private readonly repository: IAchievementTypeRepository) {}

  async execute(dto: CreateAchievementTypeDto) {
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        'AchievementType with name "' + dto.name + '" already exists',
      );
    }

    const item = await this.repository.create({
      name: dto.name,
      isActive: dto.isActive,
    });

    this.logger.log(`AchievementType created: ${item.name}`);
    return item;
  }
}
