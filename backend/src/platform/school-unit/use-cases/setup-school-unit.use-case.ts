import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateSchoolUnitDto } from '../dto/request/create-school-unit.dto.js';
import { SchoolUnitRepository } from '../repositories/school-unit.repository.js';

@Injectable()
export class SetupSchoolUnitUseCase {
  private readonly logger = new Logger(SetupSchoolUnitUseCase.name);

  constructor(private readonly repository: SchoolUnitRepository) {}

  async execute(dto: CreateSchoolUnitDto) {
    const existing = await this.repository.findFirst();
    if (existing) {
      throw new ConflictException('School unit has already been set up');
    }
    const schoolUnit = await this.repository.create(dto);
    this.logger.log(`School unit created: ${schoolUnit.name}`);
    return schoolUnit;
  }
}
