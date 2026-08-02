import { Injectable } from '@nestjs/common';
import { SubjectQueryDto } from '../dto/request/subject-query.dto.js';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';

@Injectable()
export class GetSubjectsUseCase {
  constructor(private readonly subjectRepository: ISubjectRepository) {}

  async execute(query: SubjectQueryDto) {
    const { data, total, page, limit } =
      await this.subjectRepository.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
