import { Injectable } from '@nestjs/common';
import { IStudentScoreRepository } from '../domain/interfaces/student-score-repository.interface.js';
import { StudentScoreQueryDto } from '../dto/request/student-score-query.dto.js';

@Injectable()
export class GetStudentScoresUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoreRepository,
  ) {}
  /**
   * `scope` is present when the caller is reading their own marks. It is
   * applied after the query so a supplied `enrollmentId` cannot reach another
   * student's enrolment — the studentId narrows it regardless.
   */
  async execute(query: StudentScoreQueryDto, scope?: { studentId: string }) {
    return this.studentScoreRepository.findAll({
      page: query.page,
      limit: query.limit,
      assessmentItemId: query.assessmentItemId,
      enrollmentId: query.enrollmentId,
      semesterId: query.semesterId,
      ...(scope && { studentId: scope.studentId }),
    });
  }
}
