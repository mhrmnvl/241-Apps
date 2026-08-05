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
    const schoolUnit = await this.schoolUnitRepository.create({
      name: dto.name,
      surname: dto.surname,
      nsm: dto.nsm,
      npsn: dto.npsn,
      status: dto.status,
      typeId: dto.typeId,
      npwp: dto.npwp,
      phone: dto.phone,
      email: dto.email,
      website: dto.website,
    });
    this.logger.log(`School unit created: ${schoolUnit.name}`);
    return schoolUnit;
  }
}
