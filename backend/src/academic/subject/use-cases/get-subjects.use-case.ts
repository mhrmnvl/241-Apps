import { Injectable } from '@nestjs/common';
import { SubjectQueryDto } from '../dto/subject-query.dto.js';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';

@Injectable()
export class GetSubjectsUseCase {
  constructor(private readonly repo: ISubjectRepository) {}

  async execute(query: SubjectQueryDto) {
    const { data, total, page, limit } = await this.repo.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
