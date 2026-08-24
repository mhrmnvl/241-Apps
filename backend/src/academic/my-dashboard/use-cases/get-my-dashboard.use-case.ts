import { Injectable } from '@nestjs/common';
import { IAcademicSettingRepository } from '../../academic-setting/domain/interfaces/academic-setting-repository.interface.js';
import { IStudentIdentityReadPort } from '../../student/domain/interfaces/student-identity-read.port.js';
import { ITeacherIdentityReadPort } from '../../teacher/domain/interfaces/teacher-identity-read.port.js';
import {
  IMyDashboardRepository,
  LessonRow,
} from '../domain/interfaces/my-dashboard-repository.interface.js';
import {
  LATEST_SCORE_LIMIT,
  UNGRADED_ASSESSMENT_LIMIT,
  WEEKDAY_TO_SCHEDULE_DAY,
} from '../constants/my-dashboard.constants.js';
import { MyDashboardResult } from '../domain/entities/my-dashboard.entity.js';

/**
 * One person's own dashboard, answered from their records.
 *
 * Both halves are attempted and either may be null, which is what lets one
 * endpoint serve a student, a teacher, and the person who is both. Nothing here
 * reads a role name: a school invents roles — SARPRAS exists — and a teacher
 * given one of those still has a teaching record. The same reasoning is written
 * out at length in `GetMyScheduleUseCase`, and this follows it deliberately.
 *
 * A caller who is neither gets both halves null. That is not an error: an
 * administrator has a dashboard of their own, and this endpoint simply has
 * nothing personal to say about them.
 */
@Injectable()
export class GetMyDashboardUseCase {
  constructor(
    private readonly repository: IMyDashboardRepository,
    private readonly studentIdentity: IStudentIdentityReadPort,
    private readonly teacherIdentity: ITeacherIdentityReadPort,
    private readonly academicSetting: IAcademicSettingRepository,
  ) {}

  async execute(userId: string): Promise<MyDashboardResult> {
    const [studentId, teacherId, semester, setting] = await Promise.all([
      this.studentIdentity.findStudentIdByUserId(userId),
      this.teacherIdentity.findTeacherIdByUserId(userId),
      this.repository.findActiveSemester(),
      this.academicSetting.find(),
    ]);

    const today = new Date();
    const weeklyHolidays = setting?.weeklyHolidays ?? [];
    const isWeeklyHoliday = weeklyHolidays.includes(today.getDay());
    // No Sunday in the schedule enum, so a Sunday has no lessons to look for
    // whether or not it is the school's weekly holiday.
    const scheduleDay = WEEKDAY_TO_SCHEDULE_DAY[today.getDay()] ?? null;

    const [student, teacher] = await Promise.all([
      this.studentHalf(studentId, semester?.id ?? null, scheduleDay),
      this.teacherHalf(teacherId, semester?.id ?? null, scheduleDay),
    ]);

    return {
      semester: semester ? { id: semester.id, name: semester.name } : null,
      today: { date: today.toISOString().slice(0, 10), isWeeklyHoliday },
      student,
      teacher,
    };
  }

  private async studentHalf(
    studentId: string | null,
    semesterId: string | null,
    day: ReturnType<() => (typeof WEEKDAY_TO_SCHEDULE_DAY)[number]>,
  ): Promise<MyDashboardResult['student']> {
    if (!studentId) return null;

    // Without an active semester there is no enrolment to resolve, which is a
    // real state between years rather than a failure.
    const enrolment = semesterId
      ? await this.repository.findEnrolledClassroom(studentId, semesterId)
      : null;

    const [lessons, attendance, latestScores, reportCard] = await Promise.all([
      enrolment && day
        ? this.repository.findClassroomLessons(enrolment.classroom.id, day)
        : Promise.resolve<LessonRow[]>([]),
      enrolment
        ? this.repository.summariseAttendance(enrolment.enrollmentId)
        : Promise.resolve({
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            sick: 0,
          }),
      enrolment
        ? this.repository.findLatestScores(
            enrolment.enrollmentId,
            LATEST_SCORE_LIMIT,
          )
        : Promise.resolve([]),
      this.repository.findLatestPublishedReportCard(studentId),
    ]);

    return {
      classroom: enrolment?.classroom ?? null,
      todayLessons: lessons,
      attendance,
      latestScores,
      latestReportCard: reportCard,
    };
  }

  private async teacherHalf(
    teacherId: string | null,
    semesterId: string | null,
    day: ReturnType<() => (typeof WEEKDAY_TO_SCHEDULE_DAY)[number]>,
  ): Promise<MyDashboardResult['teacher']> {
    if (!teacherId) return null;

    const [lessons, load, supervised, ungraded] = await Promise.all([
      day
        ? this.repository.findTeachingLessons(teacherId, day)
        : Promise.resolve<LessonRow[]>([]),
      semesterId
        ? this.repository.summariseTeachingLoad(teacherId, semesterId)
        : Promise.resolve({ classroomCount: 0, subjectCount: 0 }),
      semesterId
        ? this.repository.findSupervisedClassrooms(teacherId, semesterId)
        : Promise.resolve([]),
      semesterId
        ? this.repository.findUngradedAssessments(
            teacherId,
            semesterId,
            UNGRADED_ASSESSMENT_LIMIT,
          )
        : Promise.resolve({ rows: [], total: 0 }),
    ]);

    return {
      todayLessons: lessons,
      load,
      supervisedClassrooms: supervised,
      ungradedAssessments: ungraded.rows,
      ungradedTotal: ungraded.total,
    };
  }
}
