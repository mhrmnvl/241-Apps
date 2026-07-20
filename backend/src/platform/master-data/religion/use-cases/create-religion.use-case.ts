import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateReligionDto } from '../dto/request/create-religion.dto.js';
import { IReligionRepository } from '../domain/interfaces/religion-repository.interface.js';

@Injectable()
export class CreateReligionUseCase {
  private readonly logger = new Logger(CreateReligionUseCase.name);

  constructor(private readonly repository: IReligionRepository) {}

  async execute(dto: CreateReligionDto) {
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        'Religion with name "' + dto.name + '" already exists',
      );
    }

    const item = await this.repository.create({
      name: dto.name,
      isActive: dto.isActive,
    });

    this.logger.log(`Religion created: ${item.name}`);
    return item;
  }
}
