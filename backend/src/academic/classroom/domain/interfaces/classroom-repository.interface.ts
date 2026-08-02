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
}
