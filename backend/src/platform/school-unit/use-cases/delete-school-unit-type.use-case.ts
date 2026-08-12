import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ISchoolUnitTypeRepository } from '../domain/interfaces/school-unit-type-repository.interface.js';

@Injectable()
export class DeleteSchoolUnitTypeUseCase {
  private readonly logger = new Logger(DeleteSchoolUnitTypeUseCase.name);

  constructor(
    private readonly schoolUnitTypeRepository: ISchoolUnitTypeRepository,
  ) {}

  async execute(id: string) {
    const existing = await this.schoolUnitTypeRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('School unit type not found');
    }

    const linkedCount =
      await this.schoolUnitTypeRepository.countSchoolUnitsWithType(id);
    if (linkedCount > 0) {
      throw new ConflictException(
        'School unit type is still used by one or more school units and cannot be deleted',
      );
    }

    await this.schoolUnitTypeRepository.remove(id);
    this.logger.log(`School unit type deleted: ${existing.code}`);
    return { success: true };
  }
}
