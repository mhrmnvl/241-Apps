import { Injectable } from '@nestjs/common';
import { IStudentIdentityReadPort } from '../../student/domain/interfaces/student-identity-read.port.js';
import { ITeacherIdentityReadPort } from '../../teacher/domain/interfaces/teacher-identity-read.port.js';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';
import { ScheduleWithDetails } from '../domain/interfaces/schedule-repository.interface.js';

export interface MyScheduleResult {
  /** The timetable of the classroom the caller is enrolled in, if any. */
  classroom: ScheduleWithDetails[];
  /** The lessons the caller gives, if they teach. */
  teaching: ScheduleWithDetails[];
}

/**
 * The caller's own schedule, answered from their records.
 *
 * Both halves are attempted and either may be empty, which is what lets one
 * endpoint serve a student, a teacher, and the person who is both without
 * being told which they are. Somebody who teaches and also administers gets
 * their teaching schedule here and reaches any classroom through the
 * management routes, as they do today.
 *
 * What this replaces is worth naming. academic-web decided the same question by
 * comparing the signed-in user's roles to the literal 'TEACHER', so a teacher
 * whom the school had given a role of its own making — and this school makes
 * them; SARPRAS exists — was shown the administrator's classroom picker instead
 * of their own timetable. A teaching record does not care what the role is
 * called.
 */
@Injectable()
export class GetMyScheduleUseCase {
  constructor(
    private readonly scheduleRepository: IScheduleRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly studentIdentity: IStudentIdentityReadPort,
    private readonly teacherIdentity: ITeacherIdentityReadPort,
  ) {}

  async execute(userId: string): Promise<MyScheduleResult> {
    const [studentId, teacherId] = await Promise.all([
      this.studentIdentity.findStudentIdByUserId(userId),
      this.teacherIdentity.findTeacherIdByUserId(userId),
    ]);

    const [classroom, teaching] = await Promise.all([
      this.classroomSchedule(studentId),
      this.teachingSchedule(teacherId),
    ]);

    return { classroom, teaching };
  }

  /**
   * The classroom is resolved from the caller's active enrolment rather than
   * asked for, which is why the student screen needs no picker. No enrolment
   * for the active semester means an empty timetable — a real state at the
   * start of a year, and one the screen must be able to say plainly.
   */
  private async classroomSchedule(
    studentId: string | null,
  ): Promise<ScheduleWithDetails[]> {
    if (!studentId) return [];

    const enrollment =
      await this.enrollmentRepository.findActiveEnrollment(studentId);
    if (!enrollment?.classroomId) return [];

    return this.scheduleRepository.findByClassroom(enrollment.classroomId);
  }

  private async teachingSchedule(
    teacherId: string | null,
  ): Promise<ScheduleWithDetails[]> {
    if (!teacherId) return [];

    const { data } = await this.scheduleRepository.findAll({
      page: 1,
      limit: SCHEDULE_PAGE_CEILING,
      teacherId,
    });
    return data;
  }
}

/**
 * A single teacher's week, with room to spare — a timetable is bounded by the
 * days and periods in it, so this is a ceiling rather than a page size.
 */
const SCHEDULE_PAGE_CEILING = 200;
