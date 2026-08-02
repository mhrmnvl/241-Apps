import { Injectable, NotFoundException } from '@nestjs/common';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';

@Injectable()
export class GetSemesterByIdUseCase {
  constructor(private readonly semesterRepository: ISemesterRepository) {}

  async execute(id: string) {
    const semester = await this.semesterRepository.findById(id);
    if (!semester) {
      throw new NotFoundException(`Semester with ID ${id} not found`);
    }
    return semester;
  }
}
