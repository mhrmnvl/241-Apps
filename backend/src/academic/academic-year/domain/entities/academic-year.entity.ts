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
  /** The calendar year the school year opens in: 2026 for "2026/2027". */
  startYear: number;
  isActive: boolean;
  deletedAt: Date | null;
}

export interface AcademicYearWithDetails extends AcademicYearEntity {
  semesters?: SemesterRef[];
  classrooms?: ClassroomRef[];
}
