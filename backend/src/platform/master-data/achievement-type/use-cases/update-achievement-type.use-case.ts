import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAchievementTypeDto } from '../dto/request/update-achievement-type.dto.js';
import { IAchievementTypeRepository } from '../domain/interfaces/achievement-type-repository.interface.js';

@Injectable()
export class UpdateAchievementTypeUseCase {
  private readonly logger = new Logger(UpdateAchievementTypeUseCase.name);

  constructor(private readonly repository: IAchievementTypeRepository) {}

  async execute(id: string, dto: UpdateAchievementTypeDto) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('AchievementType with ID ${id} not found');
    }

    if (dto.name) {
      const existing = await this.repository.findByName(dto.name, id);
      if (existing) {
        throw new ConflictException(
          'AchievementType with name "' + dto.name + '" already exists',
        );
      }
    }

    const updated = await this.repository.update(id, dto);
    this.logger.log(`AchievementType updated: ${updated.name}`);
    return updated;
  }
}
