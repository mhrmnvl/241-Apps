import { Injectable } from '@nestjs/common';
import { ScholarshipRepository } from '../repositories/scholarship.repository.js';
import { ScholarshipQueryDto } from '../dto/scholarship-query.dto.js';

@Injectable()
export class GetScholarshipsUseCase {
  constructor(private readonly repo: ScholarshipRepository) {}

  async execute(query: ScholarshipQueryDto) {
    return this.repo.findAll(query);
  }
}
