import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateSchoolUnitDto } from '../dto/request/update-school-unit.dto.js';
import { ISchoolUnitRepository } from '../domain/interfaces/school-unit-repository.interface.js';

@Injectable()
export class UpdateSchoolUnitUseCase {
  private readonly logger = new Logger(UpdateSchoolUnitUseCase.name);

  constructor(private readonly schoolUnitRepository: ISchoolUnitRepository) {}

  async execute(dto: UpdateSchoolUnitDto) {
    const existing = await this.schoolUnitRepository.findFirst();
    if (!existing) {
      throw new NotFoundException('School unit has not been set up yet');
    }

    const schoolUnit = await this.schoolUnitRepository.update(existing.id, dto);
    this.logger.log(`School unit updated: ${schoolUnit.name}`);
    return schoolUnit;
  }
}
