import { Injectable } from '@nestjs/common';
import { ScholarshipRepository } from '../repositories/scholarship.repository.js';
import { CreateScholarshipDto } from '../dto/request/create-scholarship.dto.js';

@Injectable()
export class CreateScholarshipUseCase {
  constructor(private readonly repository: ScholarshipRepository) {}

  async execute(dto: CreateScholarshipDto) {
    return this.repository.create(dto);
  }
}
