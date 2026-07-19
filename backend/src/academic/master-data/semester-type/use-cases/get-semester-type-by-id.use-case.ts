import { Injectable, NotFoundException } from '@nestjs/common';
import { SemesterType } from '@prisma/client';
import { ISemesterTypeRepository } from '../domain/interfaces/semester-type-repository.interface.js';

@Injectable()
export class GetSemesterTypeByIdUseCase {
  constructor(private readonly repository: ISemesterTypeRepository) {}

  async execute(id: string): Promise<SemesterType> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Semester Type with ID ${id} not found`);
    }
    return existing;
  }
}
