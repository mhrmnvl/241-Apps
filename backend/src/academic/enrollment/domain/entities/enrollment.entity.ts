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
export interface StudentEnrollmentEntity {
  id: string;
  studentId: string;
  classroomId: string;
  semesterId: string;
  enrolledAt: Date;
  status?: string;
  deletedAt?: Date | null;
}

export interface EnrollmentWithDetails extends StudentEnrollmentEntity {
  student?: PersonRef;
  classroom?: ClassroomRef;
  semester?: SemesterRef;
}
