export interface ActiveAcademicYearInfo {
  id: string;
  name: string;
  semesters: { id: string; type: { id: string; name: string } }[];
}

export interface UpcomingCalendarEvent {
  id: string;
  title: string;
  type: string;
  startDate: Date;
  endDate: Date;
}

export interface TodayAttendanceSummary {
  present: number;
  absent: number;
  late: number;
  excused: number;
  sick: number;
}

export interface RecentAnnouncement {
  id: string;
  title: string;
  date: Date;
}

export interface StudentDistributionByGrade {
  grade: string;
  totalStudents: number;
}

export interface TeacherDistributionByPosition {
  category?: string;
  total: number;
}

export interface InstitutionInfo {
  id: string;
  name: string;
  status: string;
  type: { id: string; name: string; code: string } | null;
}

export abstract class IDashboardRepository {
  abstract countActiveStudents(): Promise<number>;
  abstract countActiveTeachers(): Promise<number>;
  abstract countActiveClasses(): Promise<number>;
  abstract countActiveSubjects(): Promise<number>;
  abstract countActiveInstructors(): Promise<number>;
  abstract getActiveAcademicYear(): Promise<ActiveAcademicYearInfo | null>;
  abstract getUpcomingCalendarEvents(
    limit: number,
  ): Promise<UpcomingCalendarEvent[]>;
  abstract getRecentAnnouncements(limit: number): Promise<RecentAnnouncement[]>;
  abstract getStudentDistributionByGrade(): Promise<
    StudentDistributionByGrade[]
  >;
  abstract getTeacherDistributionByPosition(): Promise<
    TeacherDistributionByPosition[]
  >;
  abstract getInstitutionInfo(): Promise<InstitutionInfo | null>;
  abstract countTodayAttendance(): Promise<TodayAttendanceSummary>;
  abstract countPendingAdmissions(): Promise<number>;
}
