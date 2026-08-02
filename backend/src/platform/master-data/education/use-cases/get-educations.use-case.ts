import { Injectable } from '@nestjs/common';
import { EducationQueryDto } from '../dto/request/education-query.dto.js';
import { IEducationRepository } from '../domain/interfaces/education-repository.interface.js';

@Injectable()
export class GetEducationsUseCase {
  constructor(private readonly educationRepository: IEducationRepository) {}

  async execute(query: EducationQueryDto) {
    const { data, total, page, limit } =
      await this.educationRepository.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
