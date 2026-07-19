import { Injectable, NotFoundException } from '@nestjs/common';
import { ScholarshipRepository } from '../repositories/scholarship.repository.js';

@Injectable()
export class DeleteScholarshipUseCase {
  constructor(private readonly repo: ScholarshipRepository) {}

  async execute(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Scholarship not found');
    await this.repo.softDelete(id);
    return { message: 'Scholarship deleted successfully' };
  }
}
