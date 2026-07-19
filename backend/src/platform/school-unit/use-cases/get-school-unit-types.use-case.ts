import { Injectable } from '@nestjs/common';
import { SchoolUnitTypeQueryDto } from '../dto/school-unit-type-query.dto.js';
import { SchoolUnitTypesRepository } from '../repositories/school-unit-types.repository.js';

@Injectable()
export class GetSchoolUnitTypesUseCase {
  constructor(private readonly repo: SchoolUnitTypesRepository) {}

  async execute(query: SchoolUnitTypeQueryDto) {
    return this.repo.findAll(query);
  }
}
