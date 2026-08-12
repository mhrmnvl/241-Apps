import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ISchoolUnitTypeRepository } from '../domain/interfaces/school-unit-type-repository.interface.js';

@Injectable()
export class UpdateSchoolUnitTypeUseCase {
  private readonly logger = new Logger(UpdateSchoolUnitTypeUseCase.name);

  constructor(
    private readonly schoolUnitTypeRepository: ISchoolUnitTypeRepository,
  ) {}

  async execute(id: string, dto: { code?: string; name?: string }) {
    const existing = await this.schoolUnitTypeRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('School unit type not found');
    }

    if (dto.code && typeof dto.code === 'string') {
      const dup = await this.schoolUnitTypeRepository.findByCode(dto.code);
      if (dup && dup.id !== id) {
        throw new ConflictException(
          `School unit type '${dto.code}' already exists`,
        );
      }
    }

    const updated = await this.schoolUnitTypeRepository.update(id, {
      code: dto.code,
      name: dto.name,
    });
    this.logger.log(`School unit type updated: ${updated.code}`);
    return updated;
  }
}
