import type {
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

export interface SemesterWithDetails extends SemesterEntity {
  /** Always resolved — the detail query includes both relations. */
  academicYear: AcademicYearRef;
  type: NamedRef;
  _count?: {
    enrollments?: number;
    teachingAssignments?: number;
  };
}
