import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateEmploymentTypeDto } from '../dto/request/create-employment-type.dto.js';
import { IEmploymentTypeRepository } from '../interfaces/employment-type-repository.interface.js';

@Injectable()
export class UpdateEmploymentTypeUseCase {
  private readonly logger = new Logger(UpdateEmploymentTypeUseCase.name);

  constructor(private readonly repo: IEmploymentTypeRepository) {}

  async execute(id: string, dto: UpdateEmploymentTypeDto) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Employment type with ID ${id} not found`);
    }

    const type = await this.repo.update(id, dto);
    this.logger.log(`Employment type updated: ${id}`);
    return type;
  }
}
