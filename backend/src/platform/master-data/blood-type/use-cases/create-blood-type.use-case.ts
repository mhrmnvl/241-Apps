import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateBloodTypeDto } from '../dto/request/create-blood-type.dto.js';
import { IBloodTypeRepository } from '../domain/interfaces/blood-type-repository.interface.js';

@Injectable()
export class CreateBloodTypeUseCase {
  private readonly logger = new Logger(CreateBloodTypeUseCase.name);

  constructor(private readonly repository: IBloodTypeRepository) {}

  async execute(dto: CreateBloodTypeDto) {
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        'BloodType with name "' + dto.name + '" already exists',
      );
    }

    const item = await this.repository.create({
      name: dto.name,
      isActive: dto.isActive,
    });

    this.logger.log(`BloodType created: ${item.name}`);
    return item;
  }
}
