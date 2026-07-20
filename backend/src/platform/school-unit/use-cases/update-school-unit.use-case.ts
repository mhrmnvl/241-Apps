import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateSchoolUnitDto } from '../dto/request/update-school-unit.dto.js';
import { SchoolUnitRepository } from '../repositories/school-unit.repository.js';

@Injectable()
export class UpdateSchoolUnitUseCase {
  private readonly logger = new Logger(UpdateSchoolUnitUseCase.name);

  constructor(private readonly repo: SchoolUnitRepository) {}

  async execute(dto: UpdateSchoolUnitDto) {
    const existing = await this.repo.findFirst();
    if (!existing) {
      throw new NotFoundException('School unit has not been set up yet');
    }

    const schoolUnit = await this.repo.update(existing.id, dto);
    this.logger.log(`School unit updated: ${schoolUnit.name}`);
    return schoolUnit;
  }
}
