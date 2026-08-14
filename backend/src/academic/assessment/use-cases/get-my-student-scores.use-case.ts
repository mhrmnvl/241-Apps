import { Injectable } from '@nestjs/common';
import { IStudentIdentityReadPort } from '../../student/domain/interfaces/student-identity-read.port.js';
import { StudentScoreQueryDto } from '../dto/request/student-score-query.dto.js';
import { GetStudentScoresUseCase } from './get-student-scores.use-case.js';

/**
 * The caller's own marks, across whichever enrolments they were recorded
 * against.
 *
 * `student-scores.read` answers for the whole school and ignores who is
 * asking. This one resolves the caller's student record and narrows through
 * the enrolment their scores hang off, so naming someone else's enrolment
 * cannot reach it.
 *
 * No student record means an empty page, returned here rather than left to
 * fall through into an unfiltered read.
 */
@Injectable()
export class GetMyStudentScoresUseCase {
  constructor(
    private readonly getStudentScores: GetStudentScoresUseCase,
    private readonly studentIdentity: IStudentIdentityReadPort,
  ) {}

  async execute(query: StudentScoreQueryDto, userId: string) {
    const studentId = await this.studentIdentity.findStudentIdByUserId(userId);

    if (!studentId) {
      return {
        data: [],
        total: 0,
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      };
    }

    return this.getStudentScores.execute(query, { studentId });
  }
}
