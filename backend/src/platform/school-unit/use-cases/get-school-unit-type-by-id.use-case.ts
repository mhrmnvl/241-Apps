import { Injectable, NotFoundException } from '@nestjs/common';
import { SchoolUnitTypesRepository } from '../repositories/school-unit-types.repository.js';

@Injectable()
export class GetSchoolUnitTypeByIdUseCase {
  constructor(private readonly repo: SchoolUnitTypesRepository) {}

  async execute(id: string) {
    const type = await this.repo.findById(id);
    if (!type) {
      throw new NotFoundException('Tipe sekolah tidak ditemukan');
    }
    return type;
  }
}
