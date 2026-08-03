import {
  ClassroomRef,
  PersonRef,
  SubjectRef,
} from '../../../../shared/domain/entities/index.js';
import { AssessmentType } from '../../../../shared/domain/enums/assessment-type.enum.js';

export interface AssessmentItemEntity {
  id: string;
  teachingAssignmentId?: string;
  typeId?: string;
  title?: string;
  name?: string;
  /** Value union, not the enum: persistence hands back a plain string. */
  type?: `${AssessmentType}`;
  weight?: number;
  maxScore?: number;
  date?: Date | null;
  deletedAt?: Date | null;
}

/** Teaching assignment as joined onto an assessment item. */
export interface AssessmentTeachingAssignmentRef {
  id: string;
  teacherId: string;
  classroomId: string;
  subjectId: string;
  semesterId: string;
  subject?: SubjectRef;
  classroom?: ClassroomRef;
  teacher?: PersonRef;
}

export interface AssessmentItemWithDetails extends AssessmentItemEntity {
  /** Always resolved — the query backing this row includes the assignment. */
  teachingAssignment: AssessmentTeachingAssignmentRef;
  _count?: {
    studentScores?: number;
  };
}
