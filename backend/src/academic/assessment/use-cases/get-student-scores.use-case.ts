import { Injectable } from '@nestjs/common';
import { IStudentScoresRepository } from '../domain/interfaces/student-scores-repository.interface.js';
import { StudentScoreQueryDto } from '../dto/request/student-score-query.dto.js';

@Injectable()
export class GetStudentScoresUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoresRepository,
  ) {}
  async execute(query: StudentScoreQueryDto) {
    return this.studentScoreRepository.findAll(query);
  }
}
