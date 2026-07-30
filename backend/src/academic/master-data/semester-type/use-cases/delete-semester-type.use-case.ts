import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ISemesterTypeRepository,
  SemesterType,
} from '../domain/interfaces/semester-type-repository.interface.js';

@Injectable()
export class DeleteSemesterTypeUseCase {
  constructor(private readonly repository: ISemesterTypeRepository) {}

  async execute(id: string): Promise<SemesterType> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Semester Type with ID ${id} not found`);
    }

    const hasRelations = await this.repository.hasRelatedData(id);
    if (hasRelations) {
      throw new BadRequestException(
        'Cannot delete Semester Type that is referenced by Semesters',
      );
    }

    return this.repository.delete(id);
  }
}
