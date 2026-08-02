import { GradeEntity } from '../entities/grade.entity.js';
import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';

export interface GradeQueryInput extends PaginationQueryInput {
  search?: string;
  isActive?: boolean;
}

export interface CreateGradeRepositoryInput {
  level: number;
  name: string;
  isActive?: boolean;
}

export type UpdateGradeRepositoryInput = Partial<CreateGradeRepositoryInput>;

export abstract class IGradeRepository {
  abstract findAll(
    query?: GradeQueryInput,
  ): Promise<PaginatedResult<GradeEntity>>;
  abstract findById(id: string): Promise<GradeEntity | null>;
  abstract findByLevel(level: number): Promise<GradeEntity | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<GradeEntity | null>;
  abstract create(input: CreateGradeRepositoryInput): Promise<GradeEntity>;
  abstract update(
    id: string,
    input: UpdateGradeRepositoryInput,
  ): Promise<GradeEntity>;
  abstract softDelete(id: string): Promise<GradeEntity>;
  abstract remove(id: string): Promise<GradeEntity>;
}
