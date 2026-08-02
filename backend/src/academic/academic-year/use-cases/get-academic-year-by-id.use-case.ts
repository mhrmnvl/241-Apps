import { Injectable, NotFoundException } from '@nestjs/common';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';

@Injectable()
export class GetAcademicYearByIdUseCase {
  constructor(
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(id: string) {
    const year = await this.academicYearRepository.findById(id);
    if (!year) {
      throw new NotFoundException(`Academic Year with ID ${id} not found`);
    }
    return year;
  }
}
