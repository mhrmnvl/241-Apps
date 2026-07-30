import { Injectable, NotFoundException } from '@nestjs/common';
import { ScholarshipRepository } from '../repositories/scholarship.repository.js';

@Injectable()
export class DeleteScholarshipUseCase {
  constructor(private readonly repository: ScholarshipRepository) {}

  async execute(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Scholarship not found');
    await this.repository.softDelete(id);
    return { message: 'Scholarship deleted successfully' };
  }
}
