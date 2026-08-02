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
  constructor(
    private readonly semesterTypeRepository: ISemesterTypeRepository,
  ) {}

  async execute(id: string): Promise<SemesterType> {
    const existing = await this.semesterTypeRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Semester Type with ID ${id} not found`);
    }

    const hasRelations = await this.semesterTypeRepository.hasRelatedData(id);
    if (hasRelations) {
      throw new BadRequestException(
        'Cannot delete Semester Type that is referenced by Semesters',
      );
    }

    return this.semesterTypeRepository.delete(id);
  }
}
