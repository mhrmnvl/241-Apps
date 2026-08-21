import {
  AttendanceRecap,
  ClassroomRef,
  LatestScoreRow,
  LessonRow,
  ReportCardRef,
  SupervisedClassroom,
  TeachingLoad,
  UngradedAssessmentRow,
} from '../interfaces/my-dashboard-repository.interface.js';

export interface MyStudentDashboard {
  /** Null between years, when no enrolment for the active semester exists yet. */
  classroom: ClassroomRef | null;
  todayLessons: LessonRow[];
  attendance: AttendanceRecap;
  latestScores: LatestScoreRow[];
  latestReportCard: ReportCardRef | null;
}

export interface MyTeacherDashboard {
  todayLessons: LessonRow[];
  load: TeachingLoad;
  supervisedClassrooms: SupervisedClassroom[];
  /** The first few, for the panel. */
  ungradedAssessments: UngradedAssessmentRow[];
  /** How many there are in total, so five shown never reads as five outstanding. */
  ungradedTotal: number;
}

/**
 * Both halves, either of which may be null.
 *
 * Null means "the caller has no such record", not "empty" — a teacher who
 * teaches nothing today still has a teacher half, with no lessons in it.
 */
export interface MyDashboardResult {
  semester: { id: string; name: string } | null;
  today: { date: string; isWeeklyHoliday: boolean };
  student: MyStudentDashboard | null;
  teacher: MyTeacherDashboard | null;
}
