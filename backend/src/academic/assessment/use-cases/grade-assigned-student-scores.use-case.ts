import { ForbiddenException, Injectable } from '@nestjs/common';
import { ITeacherIdentityReadPort } from '../../teacher/domain/interfaces/teacher-identity-read.port.js';
import { IGradingScopeReadPort } from '../domain/interfaces/grading-scope-read.port.js';
import { BulkUpsertStudentScoreDto } from '../dto/request/bulk-upsert-student-score.dto.js';
import { BulkUpsertStudentScoresUseCase } from './bulk-upsert-student-scores.use-case.js';

/**
 * Grading, narrowed to what the caller is actually responsible for.
 *
 * `student-scores.manage` answers for the whole school and asks nothing about
 * who is grading. That is right for an administrator and wrong for a teacher:
 * every teacher held it, and the screen picked a classroom and subject from
 * dropdowns listing all of them, so any teacher could enter marks for any
 * class in the school.
 *
 * Two reaches are allowed here, and both come from records:
 *
 *   - **the subject you teach**, in whichever classroom you teach it. Checked
 *     against the teaching assignment that owns the assessment item, so a
 *     teacher taking the same subject in four classes grades four classes, and
 *     nothing else.
 *   - **the classroom you supervise**, across every subject in it. This is the
 *     homeroom teacher correcting a colleague's entry, and it is recorded as
 *     such — `correctedById` on each mark, so "who changed this" has an answer
 *     that `updatedAt` alone cannot give.
 *
 * Neither reach is a role. The school names roles itself — `Wali Kelas` is one
 * of them — and a role-name check is what once showed a teacher with a custom
 * role the administrator's screen.
 *
 * A correction is all-or-nothing per request: the whole roster is either the
 * caller's own subject or a supervised classroom. Mixing them in one call would
 * mean half the marks recorded as corrections and half not, which is a worse
 * record than either.
 */
@Injectable()
export class GradeAssignedStudentScoresUseCase {
  constructor(
    private readonly bulkUpsert: BulkUpsertStudentScoresUseCase,
    private readonly teacherIdentity: ITeacherIdentityReadPort,
    private readonly gradingScope: IGradingScopeReadPort,
  ) {}

  async execute(dto: BulkUpsertStudentScoreDto, userId: string) {
    const refused = new ForbiddenException(
      'You can only grade the classes you teach or the class you supervise',
    );

    const teacherId = await this.teacherIdentity.findTeacherIdByUserId(userId);
    // No teaching record, no reach. The absence must not widen into the
    // unscoped write next door.
    if (!teacherId) throw refused;

    const teaches = await this.gradingScope.teachesAssessmentItem(
      teacherId,
      dto.assessmentItemId,
    );

    if (teaches) {
      return this.bulkUpsert.execute(dto);
    }

    // Not their subject. The only other way in is supervising the classroom
    // every one of these enrolments sits in — checked per enrolment, because a
    // request naming one of their own students and one of somebody else's must
    // not pass on the strength of the first.
    for (const record of dto.records) {
      const supervises = await this.gradingScope.supervisesEnrollment(
        teacherId,
        record.enrollmentId,
      );
      if (!supervises) throw refused;
    }

    return this.bulkUpsert.execute(dto, userId);
  }
}
