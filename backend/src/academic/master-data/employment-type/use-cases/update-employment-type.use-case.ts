import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateEmploymentTypeDto } from '../dto/request/update-employment-type.dto.js';
import { IEmploymentTypeRepository } from '../domain/interfaces/employment-type-repository.interface.js';

@Injectable()
export class UpdateEmploymentTypeUseCase {
  private readonly logger = new Logger(UpdateEmploymentTypeUseCase.name);

  constructor(
    private readonly employmentTypeRepository: IEmploymentTypeRepository,
  ) {}

  async execute(id: string, dto: UpdateEmploymentTypeDto) {
    const existing = await this.employmentTypeRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Employment type with ID ${id} not found`);
    }

    const type = await this.employmentTypeRepository.update(id, dto);
    this.logger.log(`Employment type updated: ${id}`);
    return type;
  }
}
