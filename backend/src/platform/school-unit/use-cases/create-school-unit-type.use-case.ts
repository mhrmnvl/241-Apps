import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateSchoolUnitTypeDto } from '../dto/request/create-school-unit-type.dto.js';
import { ISchoolUnitTypeRepository } from '../domain/interfaces/school-unit-type-repository.interface.js';

@Injectable()
export class CreateSchoolUnitTypeUseCase {
  private readonly logger = new Logger(CreateSchoolUnitTypeUseCase.name);

  constructor(
    private readonly schoolUnitTypeRepository: ISchoolUnitTypeRepository,
  ) {}

  async execute(dto: CreateSchoolUnitTypeDto) {
    const existing = await this.schoolUnitTypeRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException('School unit type code already exists');
    }

    const schoolUnitType = await this.schoolUnitTypeRepository.create({
      code: dto.code,
      name: dto.name,
    });
    this.logger.log(`School unit type created: ${schoolUnitType.code}`);
    return schoolUnitType;
  }
}
