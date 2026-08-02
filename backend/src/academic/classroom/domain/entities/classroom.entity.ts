import {
  AcademicYearRef,
  GradeRef,
  PersonRef,
  SemesterRef,
} from '../../../../shared/domain/entities/reference.entity.js';

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

export interface ClassroomSupervisorEntity {
  id: string;
  classroomId: string;
  teacherId: string;
  semesterId: string;
  deletedAt?: Date | null;
}

export interface ClassroomStructureEntity {
  id: string;
  classroomId: string;
  semesterId: string;
  presidentId?: string | null;
  vicePresidentId?: string | null;
  secretaryId?: string | null;
  treasurerId?: string | null;
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

export interface StructureWithDetails extends ClassroomStructureEntity {
  classroom?: ClassroomEntity;
  semester?: SemesterRef;
  president?: PersonRef | null;
  vicePresident?: PersonRef | null;
  secretary?: PersonRef | null;
  treasurer?: PersonRef | null;
}

export interface SupervisorWithDetails extends ClassroomSupervisorEntity {
  classroom?: ClassroomEntity;
  teacher?: PersonRef;
  semester?: SemesterRef;
}
