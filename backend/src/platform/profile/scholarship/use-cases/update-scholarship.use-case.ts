import { Injectable, NotFoundException } from '@nestjs/common';
import { ScholarshipRepository } from '../repositories/scholarship.repository.js';
import { UpdateScholarshipDto } from '../dto/request/update-scholarship.dto.js';

@Injectable()
export class UpdateScholarshipUseCase {
  constructor(private readonly repository: ScholarshipRepository) {}

  async execute(id: string, dto: UpdateScholarshipDto) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Scholarship not found');
    return this.repository.update(id, dto);
  }
}
