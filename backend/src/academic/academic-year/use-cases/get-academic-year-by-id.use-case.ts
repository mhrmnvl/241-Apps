import { Injectable, NotFoundException } from '@nestjs/common';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';

@Injectable()
export class GetAcademicYearByIdUseCase {
  constructor(private readonly repository: IAcademicYearRepository) {}

  async execute(id: string) {
    const year = await this.repository.findById(id);
    if (!year) {
      throw new NotFoundException(`Academic Year with ID ${id} not found`);
    }
    return year;
  }
}
