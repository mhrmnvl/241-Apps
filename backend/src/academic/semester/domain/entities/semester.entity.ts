import {
  AcademicYearRef,
  NamedRef,
} from '../../../../shared/domain/entities/index.js';

export interface SemesterEntity {
  id: string;
  academicYearId: string;
  typeId?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
  deletedAt?: Date | null;
}

export interface SemesterWithAcademicYear extends SemesterEntity {
  /** Selected as a label only: this query fetches just id+name. */
  academicYear: { id: string; name: string };
  type?: NamedRef;
}

export interface ClassroomWithGrade {
  id: string;
  name: string | null;
  code?: string | null;
  academicYearId?: string;
  grade: {
    level: number;
    name: string;
  };
}

export interface ActiveEnrollmentWithDetails {
  id: string;
  studentId: string;
  classroomId: string;
  semesterId?: string;
  student: {
    id: string;
    nis: string;
    user: {
      profile?: {
        name?: string;
      } | null;
    };
  };
  classroom: {
    id: string;
    code: string;
    grade: {
      level: number;
      name: string;
    };
  };
  reportCard?: {
    totalAverage?: number | null;
  } | null;
}

export interface SemesterWithDetails extends SemesterEntity {
  /** Always resolved — the detail query includes both relations. */
  academicYear: AcademicYearRef;
  type: NamedRef;
  _count?: {
    enrollments?: number;
    teachingAssignments?: number;
  };
}
