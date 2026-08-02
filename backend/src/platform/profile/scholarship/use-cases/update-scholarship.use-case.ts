import { Injectable, NotFoundException } from '@nestjs/common';
import { IScholarshipRepository } from '../domain/interfaces/scholarship-repository.interface.js';
import { UpdateScholarshipDto } from '../dto/request/update-scholarship.dto.js';

@Injectable()
export class UpdateScholarshipUseCase {
  constructor(private readonly scholarshipRepository: IScholarshipRepository) {}

  async execute(id: string, dto: UpdateScholarshipDto) {
    const existing = await this.scholarshipRepository.findById(id);
    if (!existing) throw new NotFoundException('Scholarship not found');
    return this.scholarshipRepository.update(id, dto);
  }
}
