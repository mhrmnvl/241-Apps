import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  TeachingAssignmentWithDetails,
  TeachingAssignmentEntity,
} from '../entities/teaching-assignment.entity.js';

export type { TeachingAssignmentWithDetails };
export interface ClassroomReference {
  id: string;
  academicYearId: string;
}
export interface SemesterReference {
  id: string;
  academicYearId: string;
}

export interface TeachingAssignmentQueryInput extends PaginationQueryInput {
  teacherId?: string;
  classroomId?: string;
  subjectId?: string;
  semesterId?: string;
}

export interface CreateTeachingAssignmentRepositoryInput {
  teacherId: string;
  classroomId: string;
  subjectId: string;
  semesterId: string;
}

export type UpdateTeachingAssignmentRepositoryInput =
  Partial<CreateTeachingAssignmentRepositoryInput> & {
    /** Null clears the override so the subject's own passing score applies again. */
    passingScore?: number | null;
  };

export type RestoreTeachingAssignmentRepositoryInput =
  Partial<CreateTeachingAssignmentRepositoryInput>;

export abstract class ITeachingAssignmentRepository {
  abstract findAll(
    query: TeachingAssignmentQueryInput,
  ): Promise<PaginatedResult<TeachingAssignmentWithDetails>>;
  abstract findById(id: string): Promise<TeachingAssignmentWithDetails | null>;
  abstract findDuplicate(
    teacherId: string,
    classroomId: string,
    subjectId: string,
    semesterId: string,
    excludeId?: string,
  ): Promise<TeachingAssignmentEntity | null>;
  abstract create(
    input: CreateTeachingAssignmentRepositoryInput,
  ): Promise<TeachingAssignmentWithDetails>;
  abstract update(
    id: string,
    input: UpdateTeachingAssignmentRepositoryInput,
  ): Promise<TeachingAssignmentWithDetails>;
  abstract findSoftDeleted(
    teacherId: string,
    classroomId: string,
    subjectId: string,
    semesterId: string,
  ): Promise<TeachingAssignmentEntity | null>;
  abstract restore(
    id: string,
    input: RestoreTeachingAssignmentRepositoryInput,
  ): Promise<TeachingAssignmentWithDetails>;
  abstract softDelete(id: string): Promise<TeachingAssignmentEntity>;
  abstract remove(id: string): Promise<TeachingAssignmentEntity>;
  abstract findClassroomById(id: string): Promise<ClassroomReference | null>;
  abstract findSemesterById(id: string): Promise<SemesterReference | null>;
}
