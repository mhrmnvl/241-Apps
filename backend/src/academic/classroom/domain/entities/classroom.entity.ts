import type {
  AcademicYearRef,
  GradeRef,
} from '../../../../shared/domain/entities/index.js';

export interface ClassroomEntity {
  id: string;
  gradeId: string;
  academicYearId: string;
  code: string;
  name: string | null;
  capacity: number;
  isActive?: boolean;
  deletedAt?: Date | null;
}

export interface ClassroomWithDetails extends ClassroomEntity {
  grade?: GradeRef;
  academicYear?: AcademicYearRef;
  _count?: {
    enrollments?: number;
    teachingAssignments?: number;
  };
}
