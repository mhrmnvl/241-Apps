import { Injectable } from '@nestjs/common';
import { ITeacherIdentityReadPort } from '../../teacher/domain/interfaces/teacher-identity-read.port.js';
import { TeachingAssignmentQueryDto } from '../dto/request/teaching-assignment-query.dto.js';
import { GetTeachingAssignmentsUseCase } from './get-teaching-assignments.use-case.js';

/**
 * The classes the caller is assigned to teach.
 *
 * The grading screen picks a classroom and a subject from dropdowns, and it
 * filled them from `GET /teaching-assignments`, which lists the whole school. A
 * teacher of Matematika in VII-A was offered Bahasa Inggris in VIII-B, and —
 * before the write was scoped — could grade it.
 *
 * The caller's teacher id is applied *after* their query, so a supplied
 * `teacherId` cannot widen it: naming a colleague returns nothing rather than
 * their classes.
 *
 * No teaching record is an empty list, not a refusal. An administrator opening
 * this has done nothing wrong; there is simply nothing of theirs, and they have
 * the school-wide route for the rest.
 */
@Injectable()
export class GetMyTeachingAssignmentsUseCase {
  constructor(
    private readonly getTeachingAssignments: GetTeachingAssignmentsUseCase,
    private readonly teacherIdentity: ITeacherIdentityReadPort,
  ) {}

  async execute(query: TeachingAssignmentQueryDto, userId: string) {
    const teacherId = await this.teacherIdentity.findTeacherIdByUserId(userId);

    if (!teacherId) {
      return {
        data: [],
        total: 0,
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      };
    }

    return this.getTeachingAssignments.execute({ ...query, teacherId });
  }
}
