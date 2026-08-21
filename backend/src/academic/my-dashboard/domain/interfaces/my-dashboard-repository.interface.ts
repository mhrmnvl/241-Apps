import { Day } from '@prisma/client';

export interface ActiveSemesterRef {
  id: string;
  name: string;
  academicYearId: string;
}

export interface ClassroomRef {
  id: string;
  code: string;
  name: string | null;
}

export interface LessonRow {
  id: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  /** The classroom being taught, for a teacher's row. */
  classroomCode: string | null;
  /** The teacher taking the lesson, for a student's row. */
  teacherName: string | null;
  room: string | null;
}

export interface AttendanceRecap {
  present: number;
  absent: number;
  late: number;
  excused: number;
  sick: number;
}

export interface LatestScoreRow {
  id: string;
  subjectName: string;
  assessmentName: string;
  score: number | null;
  maxScore: number;
}

export interface ReportCardRef {
  id: string;
  semesterName: string;
}

export interface TeachingLoad {
  classroomCount: number;
  subjectCount: number;
}

export interface SupervisedClassroom extends ClassroomRef {
  studentCount: number;
}

export interface UngradedAssessmentRow {
  id: string;
  name: string;
  subjectName: string;
  classroomCode: string;
  gradedCount: number;
  studentCount: number;
}

/**
 * Reads for one person's own dashboard.
 *
 * Every method takes the caller's already-resolved student or teacher id. None
 * of them accepts a user id, and none resolves one: identity is settled once in
 * the use case, so no query here can be pointed at somebody else by passing a
 * different argument.
 */
export abstract class IMyDashboardRepository {
  abstract findActiveSemester(): Promise<ActiveSemesterRef | null>;

  // --- student ---
  abstract findEnrolledClassroom(
    studentId: string,
    semesterId: string,
  ): Promise<{ enrollmentId: string; classroom: ClassroomRef } | null>;

  abstract findClassroomLessons(
    classroomId: string,
    day: Day,
  ): Promise<LessonRow[]>;

  abstract summariseAttendance(enrollmentId: string): Promise<AttendanceRecap>;

  abstract findLatestScores(
    enrollmentId: string,
    limit: number,
  ): Promise<LatestScoreRow[]>;

  /** Only a published report card — an unpublished one is not the student's to see. */
  abstract findLatestPublishedReportCard(
    studentId: string,
  ): Promise<ReportCardRef | null>;

  // --- teacher ---
  abstract findTeachingLessons(
    teacherId: string,
    day: Day,
  ): Promise<LessonRow[]>;

  abstract summariseTeachingLoad(
    teacherId: string,
    semesterId: string,
  ): Promise<TeachingLoad>;

  abstract findSupervisedClassrooms(
    teacherId: string,
    semesterId: string,
  ): Promise<SupervisedClassroom[]>;

  abstract findUngradedAssessments(
    teacherId: string,
    semesterId: string,
    limit: number,
  ): Promise<{ rows: UngradedAssessmentRow[]; total: number }>;
}
