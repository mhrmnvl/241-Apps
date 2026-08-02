import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ISemesterTypeRepository,
  SemesterType,
} from '../domain/interfaces/semester-type-repository.interface.js';

@Injectable()
export class GetSemesterTypeByIdUseCase {
  constructor(
    private readonly semesterTypeRepository: ISemesterTypeRepository,
  ) {}

  async execute(id: string): Promise<SemesterType> {
    const existing = await this.semesterTypeRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Semester Type with ID ${id} not found`);
    }
    return existing;
  }
}
