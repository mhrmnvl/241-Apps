import { Injectable, NotFoundException } from '@nestjs/common';
import { ScholarshipRepository } from '../repositories/scholarship.repository.js';
import { UpdateScholarshipDto } from '../dto/request/update-scholarship.dto.js';

@Injectable()
export class UpdateScholarshipUseCase {
  constructor(private readonly repo: ScholarshipRepository) {}

  async execute(id: string, dto: UpdateScholarshipDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Scholarship not found');
    return this.repo.update(id, dto);
  }
}
