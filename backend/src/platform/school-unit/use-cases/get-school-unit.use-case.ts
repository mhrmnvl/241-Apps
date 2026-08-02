import { Injectable, NotFoundException } from '@nestjs/common';
import { ISchoolUnitRepository } from '../domain/interfaces/school-unit-repository.interface.js';

@Injectable()
export class GetSchoolUnitUseCase {
  constructor(private readonly schoolUnitRepository: ISchoolUnitRepository) {}

  async execute() {
    const schoolUnit = await this.schoolUnitRepository.findFirst();
    if (!schoolUnit) {
      throw new NotFoundException('School unit has not been set up yet');
    }
    return schoolUnit;
  }
}
