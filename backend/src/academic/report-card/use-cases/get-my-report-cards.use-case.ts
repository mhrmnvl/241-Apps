import { Injectable } from '@nestjs/common';
import { IStudentIdentityReadPort } from '../../student/domain/interfaces/student-identity-read.port.js';
import { ReportCardQueryDto } from '../dto/request/report-card-query.dto.js';
import { GetReportCardsUseCase } from './get-report-cards.use-case.js';

/**
 * The caller's own published report cards.
 *
 * There is no user parameter and there cannot be one: the subject is whoever
 * signed in, resolved from their student record. Before this existed, a student
 * held `report-cards.read` and reached the school-wide list, which ignored the
 * caller entirely — every student's scores, rank and teacher's note.
 *
 * An account with no student record gets an empty page rather than a refusal.
 * They have done nothing wrong; there is simply nothing of theirs. What must
 * never happen is the null widening into an unscoped read, which is why the
 * empty case is returned explicitly rather than falling through.
 */
@Injectable()
export class GetMyReportCardsUseCase {
  constructor(
    private readonly getReportCards: GetReportCardsUseCase,
    private readonly studentIdentity: IStudentIdentityReadPort,
  ) {}

  async execute(query: ReportCardQueryDto, userId: string) {
    const studentId = await this.studentIdentity.findStudentIdByUserId(userId);

    if (!studentId) {
      return {
        data: [],
        total: 0,
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        summary: { published: 0, draft: 0, averageScore: null },
      };
    }

    return this.getReportCards.execute(query, { studentId });
  }
}
