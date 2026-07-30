import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateSchoolUnitTypeDto } from '../dto/request/create-school-unit-type.dto.js';
import { SchoolUnitTypeRepository } from '../repositories/school-unit-types.repository.js';

@Injectable()
export class CreateSchoolUnitTypeUseCase {
  private readonly logger = new Logger(CreateSchoolUnitTypeUseCase.name);

  constructor(
    private readonly schoolUnitTypeRepository: SchoolUnitTypeRepository,
  ) {}

  async execute(dto: CreateSchoolUnitTypeDto) {
    const existing = await this.schoolUnitTypeRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException('Kode tipe sekolah sudah terdaftar');
    }

    const schoolUnitType = await this.schoolUnitTypeRepository.create(dto);
    this.logger.log(`School unit type created: ${schoolUnitType.code}`);
    return schoolUnitType;
  }
}
