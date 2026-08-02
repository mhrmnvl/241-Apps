import { Injectable } from '@nestjs/common';
import { IScholarshipRepository } from '../domain/interfaces/scholarship-repository.interface.js';
import { ScholarshipQueryDto } from '../dto/request/scholarship-query.dto.js';

@Injectable()
export class GetScholarshipsUseCase {
  constructor(private readonly scholarshipRepository: IScholarshipRepository) {}

  async execute(query: ScholarshipQueryDto) {
    return this.scholarshipRepository.findAll(query);
  }
}
