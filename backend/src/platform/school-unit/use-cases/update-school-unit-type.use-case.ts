import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SchoolUnitTypeRepository } from '../repositories/school-unit-types.repository.js';

@Injectable()
export class UpdateSchoolUnitTypeUseCase {
  private readonly logger = new Logger(UpdateSchoolUnitTypeUseCase.name);

  constructor(
    private readonly schoolUnitTypeRepository: SchoolUnitTypeRepository,
  ) {}

  async execute(id: string, dto: Prisma.SchoolUnitTypeUpdateInput) {
    const existing = await this.schoolUnitTypeRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Jenis unit tidak ditemukan');
    }

    if (dto.code && typeof dto.code === 'string') {
      const dup = await this.schoolUnitTypeRepository.findByCode(dto.code, id);
      if (dup) {
        throw new ConflictException(`Jenis unit '${dto.code}' sudah ada`);
      }
    }

    const updated = await this.schoolUnitTypeRepository.update(id, dto);
    this.logger.log(`School unit type updated: ${updated.code}`);
    return updated;
  }
}
