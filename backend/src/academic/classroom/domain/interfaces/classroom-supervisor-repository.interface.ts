import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  ClassroomSupervisorEntity,
  SupervisorWithDetails,
} from '../entities/classroom-supervisor.entity.js';

export type {
  SupervisorWithDetails as ClassroomSupervisorWithDetails,
  SupervisorWithDetails,
};

export interface ClassroomSupervisorQueryInput extends PaginationQueryInput {
  classroomId?: string;
  teacherId?: string;
  semesterId?: string;
}

export interface CreateClassroomSupervisorRepositoryInput {
  classroomId: string;
  teacherId: string;
  semesterId: string;
}

export type UpdateClassroomSupervisorRepositoryInput =
  Partial<CreateClassroomSupervisorRepositoryInput>;

export abstract class IClassroomSupervisorRepository {
  abstract findAll(
    query: ClassroomSupervisorQueryInput,
  ): Promise<PaginatedResult<SupervisorWithDetails>>;
  abstract findById(id: string): Promise<SupervisorWithDetails | null>;
  abstract findAssignment(
    classroomId: string,
    semesterId: string,
    excludeId?: string,
  ): Promise<ClassroomSupervisorEntity | null>;
  abstract findTeacherAssignment(
    teacherId: string,
    semesterId: string,
    excludeId?: string,
  ): Promise<ClassroomSupervisorEntity | null>;
  abstract findTeacherById(id: string): Promise<{ id: string } | null>;
  abstract create(
    input: CreateClassroomSupervisorRepositoryInput,
  ): Promise<SupervisorWithDetails>;
  abstract update(
    id: string,
    input: UpdateClassroomSupervisorRepositoryInput,
  ): Promise<SupervisorWithDetails>;
  abstract remove(id: string): Promise<ClassroomSupervisorEntity>;
}
