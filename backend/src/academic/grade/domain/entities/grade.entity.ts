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
export interface GradeEntity {
  id: string;
  level: number;
  name: string;
  deletedAt?: Date | null;
}

export interface GradeAcademicYearEntity {
  id: string;
  gradeId: string;
  academicYearId: string;
  curriculaId?: string;
  curriculumId?: string;
  deletedAt?: Date | null;
}

export interface GradeAcademicYearWithDetails extends GradeAcademicYearEntity {
  grade?: GradeEntity;
  academicYear?: AcademicYearRef;
  curricula?: NamedRef;
}
