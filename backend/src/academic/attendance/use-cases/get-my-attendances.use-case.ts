import { Injectable } from '@nestjs/common';
import { IStudentIdentityReadPort } from '../../student/domain/interfaces/student-identity-read.port.js';
import { AttendanceQueryDto } from '../dto/request/attendance-query.dto.js';
import { GetAttendancesUseCase } from './get-attendances.use-case.js';

/**
 * The caller's own attendance rows, and their own totals over the same set.
 *
 * Deliberately not a recap. A recap is a statement about a cohort — how the
 * class did — and answering one to a self-service caller would hand them a
 * summary of other people even though no individual row was disclosed. What a
 * student legitimately wants is arithmetic over their own rows, which is what
 * the totals here are.
 *
 * `GET /academic/attendances` remains the school-wide read on
 * `attendances.read`, and `recap` and `recap/trend` stay there with it.
 */
@Injectable()
export class GetMyAttendancesUseCase {
  constructor(
    private readonly getAttendances: GetAttendancesUseCase,
    private readonly studentIdentity: IStudentIdentityReadPort,
  ) {}

  async execute(query: AttendanceQueryDto, userId: string) {
    const studentId = await this.studentIdentity.findStudentIdByUserId(userId);

    if (!studentId) {
      return {
        data: [],
        total: 0,
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      };
    }

    return this.getAttendances.execute(query, { studentId });
  }
}
