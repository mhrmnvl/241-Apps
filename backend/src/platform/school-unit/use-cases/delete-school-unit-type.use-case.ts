import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SchoolUnitTypesRepository } from '../repositories/school-unit-types.repository.js';

@Injectable()
export class DeleteSchoolUnitTypeUseCase {
  private readonly logger = new Logger(DeleteSchoolUnitTypeUseCase.name);

  constructor(private readonly repo: SchoolUnitTypesRepository) {}

  async execute(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException('Tipe sekolah tidak ditemukan');
    }

    const linkedCount = await this.repo.countSchoolUnitsWithType(id);
    if (linkedCount > 0) {
      throw new ConflictException(
        'Tipe sekolah tidak bisa dihapus karena masih digunakan oleh beberapa unit sekolah',
      );
    }

    await this.repo.remove(id);
    this.logger.log(`School unit type deleted: ${existing.code}`);
    return { success: true };
  }
}
