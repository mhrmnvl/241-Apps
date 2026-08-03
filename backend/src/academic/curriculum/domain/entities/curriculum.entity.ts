import type { AcademicYearRef } from '../../../../shared/domain/entities/index.js';
import type { CurriculumSubjectWithDetails } from './curriculum-subject.entity.js';

export interface CurriculumEntity {
  id: string;
  academicYearId: string;
  name: string;
  isActive: boolean;
  deletedAt?: Date | null;
}

export interface CurriculumWithDetails extends CurriculumEntity {
  academicYear?: AcademicYearRef;
  curriculumSubjects?: CurriculumSubjectWithDetails[];
  _count?: { gradeAcademicYears?: number };
}
