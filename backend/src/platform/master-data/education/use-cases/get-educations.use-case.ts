import { Injectable } from '@nestjs/common';
import { EducationQueryDto } from '../dto/request/education-query.dto.js';
import { IEducationRepository } from '../interfaces/education-repository.interface.js';

@Injectable()
export class GetEducationsUseCase {
  constructor(private readonly repository: IEducationRepository) {}

  async execute(query: EducationQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
