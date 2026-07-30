import { Injectable, NotFoundException } from '@nestjs/common';
import { SchoolUnitRepository } from '../repositories/school-unit.repository.js';

@Injectable()
export class GetSchoolUnitUseCase {
  constructor(private readonly repository: SchoolUnitRepository) {}

  async execute() {
    const schoolUnit = await this.repository.findFirst();
    if (!schoolUnit) {
      throw new NotFoundException('School unit has not been set up yet');
    }
    return schoolUnit;
  }
}
