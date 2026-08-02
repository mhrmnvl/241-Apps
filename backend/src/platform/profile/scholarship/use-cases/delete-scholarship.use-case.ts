import { Injectable, NotFoundException } from '@nestjs/common';
import { IScholarshipRepository } from '../domain/interfaces/scholarship-repository.interface.js';

@Injectable()
export class DeleteScholarshipUseCase {
  constructor(private readonly scholarshipRepository: IScholarshipRepository) {}

  async execute(id: string) {
    const existing = await this.scholarshipRepository.findById(id);
    if (!existing) throw new NotFoundException('Scholarship not found');
    await this.scholarshipRepository.softDelete(id);
    return { message: 'Scholarship deleted successfully' };
  }
}
