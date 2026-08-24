import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  ClassroomEntity,
  ClassroomWithDetails,
} from '../entities/classroom.entity.js';

export type { ClassroomEntity, ClassroomWithDetails };

export interface ClassroomQueryInput extends PaginationQueryInput {
  academicYearId?: string;
  gradeId?: string;
  search?: string;
  isActive?: boolean;
}

export interface CreateClassroomRepositoryInput {
  academicYearId: string;
  gradeId: string;
  code: string;
  name?: string | null;
  capacity: number;
  isActive?: boolean;
}

export type UpdateClassroomRepositoryInput =
  Partial<CreateClassroomRepositoryInput>;

/** What a copy into a new academic year did, per classroom it considered. */
export interface CopyClassroomsResult {
  created: number;
  /** Already present in the target year, matched on grade and code. */
  skipped: number;
}

export abstract class IClassroomRepository {
  abstract findAll(
    query: ClassroomQueryInput,
  ): Promise<PaginatedResult<ClassroomWithDetails>>;
  abstract findById(id: string): Promise<ClassroomWithDetails | null>;
  abstract findByCode(
    code: string,
    excludeId?: string,
  ): Promise<ClassroomEntity | null>;
  abstract findByName(
    name: string,
    academicYearId: string,
    excludeId?: string,
  ): Promise<ClassroomEntity | null>;
  abstract create(
    input: CreateClassroomRepositoryInput,
  ): Promise<ClassroomWithDetails>;
  abstract update(
    id: string,
    input: UpdateClassroomRepositoryInput,
  ): Promise<ClassroomWithDetails>;
  abstract remove(id: string): Promise<ClassroomEntity>;
  abstract softDelete(id: string): Promise<ClassroomEntity>;
  abstract findDuplicate(
    code: string,
    academicYearId?: string,
    excludeId?: string,
  ): Promise<ClassroomEntity | null>;
  abstract countEnrollments(id: string): Promise<number>;
  abstract countTeachingAssignments(id: string): Promise<number>;

  /**
   * Clones a year's classrooms into another year.
   *
   * Only the classroom itself: a new id, the target year, and the same grade,
   * code, name and capacity. Nothing that hangs off it travels — enrolments
   * are what a promotion decides student by student, and a class's officers
   * name students who will not be in it.
   *
   * Idempotent on `(academicYearId, gradeId, code)`, which is the table's own
   * unique key: running it twice creates nothing the second time, so a copy
   * interrupted halfway can simply be run again.
   */
  abstract copyToAcademicYear(
    sourceAcademicYearId: string,
    targetAcademicYearId: string,
  ): Promise<CopyClassroomsResult>;
}
