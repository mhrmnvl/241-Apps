import { Injectable } from '@nestjs/common';
import { CurriculumSubjectQueryDto } from '../dto/request/curriculum-subject-query.dto.js';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';

@Injectable()
export class GetCurriculumSubjectsUseCase {
  constructor(
    private readonly curriculumSubjectRepository: ICurriculumSubjectRepository,
  ) {}

  async execute(query: CurriculumSubjectQueryDto) {
    return this.curriculumSubjectRepository.findAll({
      page: query.page,
      limit: query.limit,
      curriculumId: query.curriculumId,
      subjectId: query.subjectId,
    });
  }
}
