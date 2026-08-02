import { Injectable } from '@nestjs/common';
import { GradeQueryDto } from '../dto/request/grade-query.dto.js';
import { IGradeRepository } from '../domain/interfaces/grade-repository.interface.js';

@Injectable()
export class GetGradesUseCase {
  constructor(private readonly gradeRepository: IGradeRepository) {}

  async execute(query: GradeQueryDto) {
    return this.gradeRepository.findAll(query);
  }
}
