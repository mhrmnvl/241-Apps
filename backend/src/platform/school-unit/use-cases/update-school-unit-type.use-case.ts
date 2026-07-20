import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateSchoolUnitTypeDto } from '../dto/request/update-school-unit-type.dto.js';
import { SchoolUnitTypesRepository } from '../repositories/school-unit-types.repository.js';

@Injectable()
export class UpdateSchoolUnitTypeUseCase {
  private readonly logger = new Logger(UpdateSchoolUnitTypeUseCase.name);

  constructor(private readonly repo: SchoolUnitTypesRepository) {}

  async execute(id: string, dto: UpdateSchoolUnitTypeDto) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException('Tipe sekolah tidak ditemukan');
    }

    const updated = await this.repo.update(id, dto);
    this.logger.log(`School unit type updated: ${updated.code}`);
    return updated;
  }
}
