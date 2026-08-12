import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  SubjectEntity,
  SubjectWithTeachers,
} from '../entities/subject.entity.js';

export type { SubjectWithTeachers };

export interface SubjectQueryInput extends PaginationQueryInput {
  search?: string;
}

/**
 * Teachers are deliberately absent from both write inputs: a teacher is bound
 * to a (classroom, semester) pair, so assigning one belongs to the
 * teaching-assignment module, not to editing the subject itself.
 */
export interface CreateSubjectRepositoryInput {
  code?: string;
  name: string;
}

export interface UpdateSubjectRepositoryInput {
  code?: string;
  name?: string;
}

export abstract class ISubjectRepository {
  abstract findAll(
    query: SubjectQueryInput,
  ): Promise<PaginatedResult<SubjectWithTeachers>>;

  abstract findById(id: string): Promise<SubjectWithTeachers | null>;

  abstract findByCode(
    code: string,
    excludeId?: string,
  ): Promise<SubjectEntity | null>;

  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<SubjectEntity | null>;

  abstract create(input: CreateSubjectRepositoryInput): Promise<SubjectEntity>;

  abstract update(
    id: string,
    input: UpdateSubjectRepositoryInput,
  ): Promise<SubjectEntity>;

  abstract remove(id: string): Promise<SubjectEntity>;

  abstract countActiveAssignments(id: string): Promise<number>;
}
