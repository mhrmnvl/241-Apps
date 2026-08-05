import { Injectable } from '@nestjs/common';
import { SubjectQueryDto } from '../dto/request/subject-query.dto.js';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';

@Injectable()
export class GetSubjectsUseCase {
  constructor(private readonly subjectRepository: ISubjectRepository) {}

  async execute(query: SubjectQueryDto) {
    // Explicit mapping keeps HTTP-only query fields from reaching the port.
    const { data, total, page, limit } = await this.subjectRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
