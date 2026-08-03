import type {
  AcademicYearRef,
  NamedRef,
} from '../../../../shared/domain/entities/index.js';
import type { GradeEntity } from './grade.entity.js';

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
