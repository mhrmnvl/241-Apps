import { Injectable } from '@nestjs/common';
import { ISchoolUnitTypeRepository } from '../domain/interfaces/school-unit-type-repository.interface.js';

@Injectable()
export class GetSchoolUnitTypesUseCase {
  constructor(
    private readonly schoolUnitTypeRepository: ISchoolUnitTypeRepository,
  ) {}

  async execute() {
    return this.schoolUnitTypeRepository.findAll();
  }
}
