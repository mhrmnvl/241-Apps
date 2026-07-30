import { Injectable, NotFoundException } from '@nestjs/common';
import { SchoolUnitTypeRepository } from '../repositories/school-unit-types.repository.js';

@Injectable()
export class GetSchoolUnitTypeByIdUseCase {
  constructor(
    private readonly schoolUnitTypeRepository: SchoolUnitTypeRepository,
  ) {}

  async execute(id: string) {
    const item = await this.schoolUnitTypeRepository.findById(id);
    if (!item) {
      throw new NotFoundException('Jenis unit tidak ditemukan');
    }
    return item;
  }
}
