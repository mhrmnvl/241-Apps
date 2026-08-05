import { Injectable, NotFoundException } from '@nestjs/common';
import { IScholarshipRepository } from '../domain/interfaces/scholarship-repository.interface.js';
import { UpdateScholarshipDto } from '../dto/request/update-scholarship.dto.js';

@Injectable()
export class UpdateScholarshipUseCase {
  constructor(private readonly scholarshipRepository: IScholarshipRepository) {}

  async execute(id: string, dto: UpdateScholarshipDto) {
    const existing = await this.scholarshipRepository.findById(id);
    if (!existing) throw new NotFoundException('Scholarship not found');
    // `profileId` is absent from the update DTO on purpose: a scholarship
    // cannot be moved to a different profile.
    return this.scholarshipRepository.update(id, {
      name: dto.name,
      provider: dto.provider,
      year: dto.year,
      status: dto.status,
    });
  }
}
