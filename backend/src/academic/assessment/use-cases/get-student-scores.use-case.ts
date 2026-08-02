import { Injectable } from '@nestjs/common';
import { IStudentScoreRepository } from '../domain/interfaces/student-score-repository.interface.js';
import { StudentScoreQueryDto } from '../dto/request/student-score-query.dto.js';

@Injectable()
export class GetStudentScoresUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoreRepository,
  ) {}
  async execute(query: StudentScoreQueryDto) {
    return this.studentScoreRepository.findAll(query);
  }
}
