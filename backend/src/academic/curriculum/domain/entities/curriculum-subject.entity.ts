import type {
  GradeRef,
  SubjectRef,
} from '../../../../shared/domain/entities/index.js';
import type { CurriculumEntity } from './curriculum.entity.js';

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

export interface CurriculumSubjectWithDetails extends CurriculumSubjectEntity {
  curriculum?: CurriculumEntity;
  subject?: SubjectRef;
  grade?: GradeRef | null;
}
