import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { OccupationEntity } from '../entities/occupation.entity.js';
import { OccupationWithCount } from '../entities/occupation.entity.js';

export type { OccupationWithCount };

export interface OccupationQueryInput extends PaginationQueryInput {
  search?: string;
  isActive?: boolean;
}

export interface CreateOccupationRepositoryInput {
  name: string;
  isActive?: boolean;
}

export interface UpdateOccupationRepositoryInput {
  name?: string;
  isActive?: boolean;
}

export abstract class IOccupationRepository {
  abstract findAll(
    query: OccupationQueryInput,
  ): Promise<PaginatedResult<OccupationWithCount>>;

  abstract findById(id: string): Promise<OccupationWithCount | null>;

  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<OccupationEntity | null>;

  abstract create(
    dto: CreateOccupationRepositoryInput,
  ): Promise<OccupationEntity>;

  abstract update(
    id: string,
    dto: UpdateOccupationRepositoryInput,
  ): Promise<OccupationEntity>;

  abstract remove(id: string): Promise<OccupationEntity>;

  abstract countParentsWithOccupation(id: string): Promise<number>;

  abstract countActiveParents(id: string): Promise<number>;
}
