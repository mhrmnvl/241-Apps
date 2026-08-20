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
  deletedAt: Date | null;
}

export interface AcademicYearWithDetails extends AcademicYearEntity {
  semesters?: SemesterRef[];
  classrooms?: ClassroomRef[];
}
