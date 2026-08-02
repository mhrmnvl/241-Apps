import { Injectable, NotFoundException } from '@nestjs/common';
import { ISchoolUnitTypeRepository } from '../domain/interfaces/school-unit-type-repository.interface.js';

@Injectable()
export class GetSchoolUnitTypeByIdUseCase {
  constructor(
    private readonly schoolUnitTypeRepository: ISchoolUnitTypeRepository,
  ) {}

  async execute(id: string) {
    const item = await this.schoolUnitTypeRepository.findById(id);
    if (!item) {
      throw new NotFoundException('Jenis unit tidak ditemukan');
    }
    return item;
  }
}
