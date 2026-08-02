import { Injectable } from '@nestjs/common';
import { IScholarshipRepository } from '../domain/interfaces/scholarship-repository.interface.js';
import { CreateScholarshipDto } from '../dto/request/create-scholarship.dto.js';

@Injectable()
export class CreateScholarshipUseCase {
  constructor(private readonly scholarshipRepository: IScholarshipRepository) {}

  async execute(dto: CreateScholarshipDto) {
    return this.scholarshipRepository.create(dto);
  }
}
