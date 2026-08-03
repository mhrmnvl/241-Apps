import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  ClassroomStructureEntity,
  StructureWithDetails,
} from '../entities/classroom-structure.entity.js';

export type StudentSemesterStructureResult = StructureWithDetails;

export interface ClassroomStructureQueryInput extends PaginationQueryInput {
  classroomId?: string;
  semesterId?: string;
}

export interface CreateClassroomStructureRepositoryInput {
  classroomId: string;
  semesterId: string;
  presidentId?: string | null;
  vicePresidentId?: string | null;
  secretaryId?: string | null;
  treasurerId?: string | null;
}

export type UpdateClassroomStructureRepositoryInput =
  Partial<CreateClassroomStructureRepositoryInput>;

export type {
  StructureWithDetails as ClassroomStructureWithDetails,
  StructureWithDetails,
};

export abstract class IClassroomStructureRepository {
  abstract findAll(
    query: ClassroomStructureQueryInput,
  ): Promise<PaginatedResult<StructureWithDetails>>;
  abstract findById(id: string): Promise<StructureWithDetails | null>;
  abstract findStructure(
    classroomId: string,
    semesterId: string,
    excludeId?: string,
  ): Promise<StructureWithDetails | null>;
  abstract create(
    input: CreateClassroomStructureRepositoryInput,
  ): Promise<StructureWithDetails>;
  abstract update(
    id: string,
    input: UpdateClassroomStructureRepositoryInput,
  ): Promise<StructureWithDetails>;
  abstract remove(id: string): Promise<ClassroomStructureEntity>;
  abstract softDelete(id: string): Promise<ClassroomStructureEntity>;
}
