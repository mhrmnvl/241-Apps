import { Injectable, NotFoundException } from '@nestjs/common';
import { ScholarshipRepository } from '../repositories/scholarship.repository.js';

@Injectable()
export class GetScholarshipByIdUseCase {
  constructor(private readonly repo: ScholarshipRepository) {}

  async execute(id: string) {
    const scholarship = await this.repo.findById(id);
    if (!scholarship) throw new NotFoundException('Scholarship not found');
    return scholarship;
  }
}
