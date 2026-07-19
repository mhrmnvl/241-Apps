import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateBloodTypeDto } from '../dto/update-blood-type.dto.js';
import { IBloodTypeRepository } from '../domain/interfaces/blood-type-repository.interface.js';

@Injectable()
export class UpdateBloodTypeUseCase {
  private readonly logger = new Logger(UpdateBloodTypeUseCase.name);

  constructor(private readonly repository: IBloodTypeRepository) {}

  async execute(id: string, dto: UpdateBloodTypeDto) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('BloodType with ID ${id} not found');
    }

    if (dto.name) {
      const existing = await this.repository.findByName(dto.name, id);
      if (existing) {
        throw new ConflictException(
          'BloodType with name "' + dto.name + '" already exists',
        );
      }
    }

    const updated = await this.repository.update(id, dto);
    this.logger.log(`BloodType updated: ${updated.name}`);
    return updated;
  }
}
