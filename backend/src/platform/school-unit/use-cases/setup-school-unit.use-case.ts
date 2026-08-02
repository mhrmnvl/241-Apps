import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateSchoolUnitDto } from '../dto/request/create-school-unit.dto.js';
import { ISchoolUnitRepository } from '../domain/interfaces/school-unit-repository.interface.js';

@Injectable()
export class SetupSchoolUnitUseCase {
  private readonly logger = new Logger(SetupSchoolUnitUseCase.name);

  constructor(private readonly schoolUnitRepository: ISchoolUnitRepository) {}

  async execute(dto: CreateSchoolUnitDto) {
    const existing = await this.schoolUnitRepository.findFirst();
    if (existing) {
      throw new ConflictException('School unit has already been set up');
    }
    const schoolUnit = await this.schoolUnitRepository.create(dto);
    this.logger.log(`School unit created: ${schoolUnit.name}`);
    return schoolUnit;
  }
}
