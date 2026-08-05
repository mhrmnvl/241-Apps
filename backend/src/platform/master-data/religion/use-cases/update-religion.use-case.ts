import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateReligionDto } from '../dto/request/update-religion.dto.js';
import { IReligionRepository } from '../domain/interfaces/religion-repository.interface.js';

@Injectable()
export class UpdateReligionUseCase {
  private readonly logger = new Logger(UpdateReligionUseCase.name);

  constructor(private readonly religionRepository: IReligionRepository) {}

  async execute(id: string, dto: UpdateReligionDto) {
    const item = await this.religionRepository.findById(id);
    if (!item) {
      throw new NotFoundException('Religion with ID ${id} not found');
    }

    if (dto.name) {
      const existing = await this.religionRepository.findByName(dto.name, id);
      if (existing) {
        throw new ConflictException(
          'Religion with name "' + dto.name + '" already exists',
        );
      }
    }

    const updated = await this.religionRepository.update(id, {
      name: dto.name,
      isActive: dto.isActive,
    });
    this.logger.log(`Religion updated: ${updated.name}`);
    return updated;
  }
}
