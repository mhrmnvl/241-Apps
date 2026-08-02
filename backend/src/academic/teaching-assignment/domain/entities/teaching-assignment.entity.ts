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
export interface TeachingAssignmentEntity {
  id: string;
  teacherId: string;
  subjectId: string;
  classroomId: string;
  semesterId: string;
  deletedAt?: Date | null;
}

export interface TeachingAssignmentWithDetails extends TeachingAssignmentEntity {
  teacher?: PersonRef;
  subject?: SubjectRef;
  classroom?: ClassroomRef;
  semester?: SemesterRef;
}
