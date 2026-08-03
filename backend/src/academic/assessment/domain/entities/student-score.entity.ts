import type { PersonRef } from '../../../../shared/domain/entities/index.js';
import type { AssessmentItemEntity } from './assessment-item.entity.js';

export interface StudentScoreEntity {
  id: string;
  assessmentItemId?: string;
  studentEnrollmentId?: string;
  enrollmentId?: string;
  score?: number | null;
  note?: string | null;
  feedback?: string | null;
  deletedAt?: Date | null;
}

export interface ScoredEnrollmentRef {
  id: string;
  studentId: string;
  classroomId: string;
  semesterId: string;
  student?: PersonRef;
}

export interface StudentScoreWithDetails extends StudentScoreEntity {
  assessmentItem?: AssessmentItemEntity;
  enrollment?: ScoredEnrollmentRef;
}

export type StudentScoreWithReportCardDetails = StudentScoreWithDetails;
