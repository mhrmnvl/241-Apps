import { Injectable, NotFoundException } from '@nestjs/common';
import { IScholarshipRepository } from '../domain/interfaces/scholarship-repository.interface.js';

@Injectable()
export class GetScholarshipByIdUseCase {
  constructor(private readonly scholarshipRepository: IScholarshipRepository) {}

  async execute(id: string) {
    const scholarship = await this.scholarshipRepository.findById(id);
    if (!scholarship) throw new NotFoundException('Scholarship not found');
    return scholarship;
  }
}
