import {
  AcademicYearRef,
  GradeRef,
  SubjectRef,
} from '../../../../shared/domain/entities/index.js';

export interface CurriculumEntity {
  id: string;
  academicYearId: string;
  name: string;
  isActive: boolean;
  deletedAt?: Date | null;
}

export interface CurriculumSubjectEntity {
  id: string;
  curriculaId?: string;
  curriculumId?: string;
  subjectId: string;
  gradeId?: string;
  weeklyHours?: number;
  hoursPerWeek?: number;
  deletedAt?: Date | null;
}

export interface CurriculumWithDetails extends CurriculumEntity {
  academicYear?: AcademicYearRef;
  curriculumSubjects?: CurriculumSubjectWithDetails[];
  _count?: { gradeAcademicYears?: number };
}

export interface CurriculumSubjectWithDetails extends CurriculumSubjectEntity {
  curriculum?: CurriculumEntity;
  subject?: SubjectRef;
  grade?: GradeRef | null;
}
