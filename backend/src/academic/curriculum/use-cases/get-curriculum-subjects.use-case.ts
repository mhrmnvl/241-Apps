import { Injectable } from '@nestjs/common';
import { CurriculumSubjectQueryDto } from '../dto/curriculum-subject-query.dto.js';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';

@Injectable()
export class GetCurriculumSubjectsUseCase {
  constructor(private readonly repository: ICurriculumSubjectRepository) {}

  async execute(query: CurriculumSubjectQueryDto) {
    return this.repository.findAll(query);
  }
}
