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
export interface StudentGraduationEntity {
  id: string;
  studentId: string;
  academicYearId: string;
  graduationDate?: Date | null;
  certificateNumber?: string | null;
  certificateNo?: string | null;
  notes?: string | null;
  deletedAt?: Date | null;
}

export interface StudentGraduationWithDetails extends StudentGraduationEntity {
  student?: PersonRef;
  academicYear?: AcademicYearRef;
  certificateNo?: string | null;
}

export type GraduationWithDetails = StudentGraduationWithDetails;
