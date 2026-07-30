import { Injectable } from '@nestjs/common';
import { SchoolUnitTypeQueryInput } from '../domain/interfaces/school-unit-types-repository.interface.js';
import { SchoolUnitTypeRepository } from '../repositories/school-unit-types.repository.js';

@Injectable()
export class GetSchoolUnitTypesUseCase {
  constructor(
    private readonly schoolUnitTypeRepository: SchoolUnitTypeRepository,
  ) {}

  async execute(query: SchoolUnitTypeQueryInput) {
    return this.schoolUnitTypeRepository.findAll(query);
  }
}
