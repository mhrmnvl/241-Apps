import { Injectable, Logger } from '@nestjs/common';
import { CreateSchoolUnitDto } from '../dto/create-school-unit.dto.js';
import { SchoolUnitRepository } from '../repositories/school-unit.repository.js';

@Injectable()
export class SetupSchoolUnitUseCase {
  private readonly logger = new Logger(SetupSchoolUnitUseCase.name);

  constructor(private readonly repo: SchoolUnitRepository) {}

  async execute(dto: CreateSchoolUnitDto) {
    const schoolUnit = await this.repo.create(dto);
    this.logger.log(`School unit created: ${schoolUnit.name}`);
    return schoolUnit;
  }
}
