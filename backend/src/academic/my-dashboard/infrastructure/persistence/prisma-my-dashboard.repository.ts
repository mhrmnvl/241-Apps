import { Injectable } from '@nestjs/common';
import { Day, EnrollmentStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { USER_REF_SELECT } from '../../../../shared/domain/prisma-selects.js';
import {
  ActiveSemesterRef,
  AttendanceRecap,
  ClassroomRef,
  IMyDashboardRepository,
  LatestScoreRow,
  LessonRow,
  ReportCardRef,
  SupervisedClassroom,
  TeachingLoad,
  UngradedAssessmentRow,
} from '../../domain/interfaces/my-dashboard-repository.interface.js';

/** `1970-01-01T07:00:00.000Z` is a time column; the wall clock is in the string. */
function clock(value: Date): string {
  return value.toISOString().slice(11, 16);
}

@Injectable()
export class PrismaMyDashboardRepository extends IMyDashboardRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findActiveSemester(): Promise<ActiveSemesterRef | null> {
    const semester = await this.prisma.semester.findFirst({
      where: { isActive: true, deletedAt: null },
      select: {
        id: true,
        academicYearId: true,
        type: { select: { name: true } },
      },
    });
    if (!semester) return null;
    return {
      id: semester.id,
      name: semester.type?.name ?? '',
      academicYearId: semester.academicYearId,
    };
  }

  async findEnrolledClassroom(
    studentId: string,
    semesterId: string,
  ): Promise<{ enrollmentId: string; classroom: ClassroomRef } | null> {
    const enrollment = await this.prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        semesterId,
        status: EnrollmentStatus.ACTIVE,
        deletedAt: null,
      },
      select: {
        id: true,
        classroom: { select: { id: true, code: true, name: true } },
      },
    });
    if (!enrollment) return null;
    return { enrollmentId: enrollment.id, classroom: enrollment.classroom };
  }

  async findClassroomLessons(
    classroomId: string,
    day: Day,
  ): Promise<LessonRow[]> {
    const rows = await this.prisma.schedule.findMany({
      where: {
        day,
        deletedAt: null,
        teachingAssignment: { classroomId, deletedAt: null },
      },
      select: {
        id: true,
        room: true,
        timeSlot: { select: { startTime: true, endTime: true, order: true } },
        teachingAssignment: {
          select: {
            subject: { select: { name: true } },
            // A timetable row names the teacher and nothing else. The shared
            // select is what keeps that true: `User` owns `passwordHash`, and
            // `profile: true` would carry sixteen identifying columns.
            teacher: { select: { user: USER_REF_SELECT } },
          },
        },
      },
      orderBy: { timeSlot: { order: 'asc' } },
    });

    return rows.map((row) => ({
      id: row.id,
      startTime: clock(row.timeSlot.startTime),
      endTime: clock(row.timeSlot.endTime),
      subjectName: row.teachingAssignment.subject.name,
      classroomCode: null,
      teacherName: row.teachingAssignment.teacher.user?.profile?.name ?? null,
      room: row.room,
    }));
  }

  async findTeachingLessons(teacherId: string, day: Day): Promise<LessonRow[]> {
    const rows = await this.prisma.schedule.findMany({
      where: {
        day,
        deletedAt: null,
        teachingAssignment: { teacherId, deletedAt: null },
      },
      select: {
        id: true,
        room: true,
        timeSlot: { select: { startTime: true, endTime: true, order: true } },
        teachingAssignment: {
          select: {
            subject: { select: { name: true } },
            classroom: { select: { code: true } },
          },
        },
      },
      orderBy: { timeSlot: { order: 'asc' } },
    });

    return rows.map((row) => ({
      id: row.id,
      startTime: clock(row.timeSlot.startTime),
      endTime: clock(row.timeSlot.endTime),
      subjectName: row.teachingAssignment.subject.name,
      classroomCode: row.teachingAssignment.classroom.code,
      teacherName: null,
      room: row.room,
    }));
  }

  /**
   * Counted in the database rather than by loading the rows: a semester of
   * per-lesson marks is thousands of them, and the screen shows five numbers.
   */
  async summariseAttendance(enrollmentId: string): Promise<AttendanceRecap> {
    const grouped = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: { enrollmentId, deletedAt: null },
      _count: { _all: true },
    });

    const recap: AttendanceRecap = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      sick: 0,
    };
    const key = {
      PRESENT: 'present',
      ABSENT: 'absent',
      LATE: 'late',
      EXCUSED: 'excused',
      SICK: 'sick',
    } as const;

    for (const row of grouped) {
      recap[key[row.status]] = row._count._all;
    }
    return recap;
  }

  async findLatestScores(
    enrollmentId: string,
    limit: number,
  ): Promise<LatestScoreRow[]> {
    const rows = await this.prisma.studentScore.findMany({
      where: { enrollmentId, deletedAt: null, score: { not: null } },
      select: {
        id: true,
        score: true,
        assessmentItem: {
          select: {
            name: true,
            maxScore: true,
            teachingAssignment: {
              select: { subject: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      subjectName: row.assessmentItem.teachingAssignment.subject.name,
      assessmentName: row.assessmentItem.name,
      score: row.score,
      maxScore: row.assessmentItem.maxScore,
    }));
  }

  async findLatestPublishedReportCard(
    studentId: string,
  ): Promise<ReportCardRef | null> {
    const card = await this.prisma.reportCard.findFirst({
      // Published only. An unpublished report card is a draft the school has
      // not handed over, and this endpoint answers to the student.
      where: {
        isPublished: true,
        deletedAt: null,
        enrollment: { studentId, deletedAt: null },
      },
      select: {
        id: true,
        enrollment: {
          select: {
            semester: { select: { type: { select: { name: true } } } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    if (!card) return null;
    return {
      id: card.id,
      semesterName: card.enrollment.semester.type?.name ?? '',
    };
  }

  async summariseTeachingLoad(
    teacherId: string,
    semesterId: string,
  ): Promise<TeachingLoad> {
    const rows = await this.prisma.teachingAssignment.findMany({
      where: { teacherId, semesterId, deletedAt: null },
      select: { classroomId: true, subjectId: true },
    });

    return {
      classroomCount: new Set(rows.map((r) => r.classroomId)).size,
      subjectCount: new Set(rows.map((r) => r.subjectId)).size,
    };
  }

  async findSupervisedClassrooms(
    teacherId: string,
    semesterId: string,
  ): Promise<SupervisedClassroom[]> {
    const rows = await this.prisma.classroomSupervisor.findMany({
      where: { teacherId, semesterId, deletedAt: null },
      select: {
        classroom: {
          select: {
            id: true,
            code: true,
            name: true,
            _count: {
              select: {
                enrollments: {
                  where: {
                    semesterId,
                    status: EnrollmentStatus.ACTIVE,
                    deletedAt: null,
                  },
                },
              },
            },
          },
        },
      },
    });

    return rows.map((row) => ({
      id: row.classroom.id,
      code: row.classroom.code,
      name: row.classroom.name,
      studentCount: row.classroom._count.enrollments,
    }));
  }

  /**
   * Assessments this teacher has set that not every student in the class has a
   * mark for.
   *
   * "Ungraded" means fewer marks than enrolled students — a mark with a null
   * score counts as still outstanding, because entering the row and entering
   * the number are the same act to whoever is doing it.
   */
  async findUngradedAssessments(
    teacherId: string,
    semesterId: string,
    limit: number,
  ): Promise<{ rows: UngradedAssessmentRow[]; total: number }> {
    const items = await this.prisma.assessmentItem.findMany({
      where: {
        deletedAt: null,
        teachingAssignment: { teacherId, semesterId, deletedAt: null },
      },
      select: {
        id: true,
        name: true,
        teachingAssignment: {
          select: {
            classroomId: true,
            classroom: { select: { code: true } },
            subject: { select: { name: true } },
          },
        },
        _count: {
          select: {
            studentScores: { where: { deletedAt: null, score: { not: null } } },
          },
        },
      },
      // Assessment items carry no timestamp, so "latest" is not available to
      // order by. Name is at least stable, which keeps the panel from
      // reshuffling between two loads that found the same work outstanding.
      orderBy: { name: 'asc' },
    });

    if (items.length === 0) return { rows: [], total: 0 };

    const classroomIds = [
      ...new Set(items.map((i) => i.teachingAssignment.classroomId)),
    ];
    const enrolments = await this.prisma.studentEnrollment.groupBy({
      by: ['classroomId'],
      where: {
        classroomId: { in: classroomIds },
        semesterId,
        status: EnrollmentStatus.ACTIVE,
        deletedAt: null,
      },
      _count: { _all: true },
    });
    const sizeOf = new Map(
      enrolments.map((e) => [e.classroomId, e._count._all]),
    );

    const outstanding = items
      .map((item) => ({
        id: item.id,
        name: item.name,
        subjectName: item.teachingAssignment.subject.name,
        classroomCode: item.teachingAssignment.classroom.code,
        gradedCount: item._count.studentScores,
        studentCount: sizeOf.get(item.teachingAssignment.classroomId) ?? 0,
      }))
      // A class with nobody enrolled has nothing outstanding; it is empty, not
      // behind, and reporting it as work to do would be noise every term.
      .filter(
        (row) => row.studentCount > 0 && row.gradedCount < row.studentCount,
      );

    return { rows: outstanding.slice(0, limit), total: outstanding.length };
  }
}
