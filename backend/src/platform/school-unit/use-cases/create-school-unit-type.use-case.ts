import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateSchoolUnitTypeDto } from '../dto/request/create-school-unit-type.dto.js';
import { SchoolUnitTypesRepository } from '../repositories/school-unit-types.repository.js';

@Injectable()
export class CreateSchoolUnitTypeUseCase {
  private readonly logger = new Logger(CreateSchoolUnitTypeUseCase.name);

  constructor(private readonly repo: SchoolUnitTypesRepository) {}

  async execute(dto: CreateSchoolUnitTypeDto) {
    const existing = await this.repo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException('Kode tipe sekolah sudah terdaftar');
    }

    const schoolUnitType = await this.repo.create(dto);
    this.logger.log(`School unit type created: ${schoolUnitType.code}`);
    return schoolUnitType;
  }
}
