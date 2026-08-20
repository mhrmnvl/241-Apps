import {
  AcademicYearRef,
  ClassroomRef,
  CodedRef,
  GradeRef,
  NamedRef,
  PersonRef,
  SemesterRef,
  SubjectRef,
} from '../../../../shared/domain/entities/index.js';
export interface AcademicYearEntity {
  id: string;
  name: string;
  isActive: boolean;
  /** Weekdays school does not run, 0 (Sunday) to 6 (Saturday). */
  weeklyHolidays: number[];
  deletedAt: Date | null;
}

export interface AcademicYearWithDetails extends AcademicYearEntity {
  semesters?: SemesterRef[];
  classrooms?: ClassroomRef[];
}
