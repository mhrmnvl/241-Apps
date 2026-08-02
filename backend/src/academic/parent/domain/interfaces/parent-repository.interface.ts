import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { IncomeRange } from '../../../../shared/domain/enums/income-range.enum.js';
import {
  ProfileEntity,
  ProfileUpdateInput,
} from '../../../../platform/profile/domain/entities/profile.entity.js';
import {
  ParentEntity,
  ParentWithDetails,
  ParentListWithDetails,
} from '../entities/parent.entity.js';

export type { ParentWithDetails, ParentListWithDetails };

export interface OccupationRef {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ParentQueryInput extends PaginationQueryInput {
  search?: string;
  occupationId?: string;
}

export interface CreateParentRepositoryInput {
  name: string;
  nik: string;
  birthPlace: string;
  birthDate: Date;
  email?: string;
  phone?: string;
  occupationId: string;
  income?: IncomeRange;
}

export type UpdateParentRepositoryInput = Partial<CreateParentRepositoryInput>;

export abstract class IParentRepository {
  abstract findAll(
    query: ParentQueryInput,
  ): Promise<PaginatedResult<ParentListWithDetails>>;
  abstract findById(id: string): Promise<ParentWithDetails | null>;
  abstract findByUserId(userId: string): Promise<ParentWithDetails | null>;
  abstract findByNik(
    nik: string,
    excludeId?: string,
  ): Promise<ParentWithDetails | null>;
  abstract findOccupationById(id: string): Promise<OccupationRef | null>;
  abstract create(
    input: CreateParentRepositoryInput,
    hashedPassword?: string,
  ): Promise<ParentWithDetails>;
  abstract update(
    id: string,
    input: UpdateParentRepositoryInput,
  ): Promise<ParentWithDetails>;
  abstract updateProfile(
    userId: string,
    data: ProfileUpdateInput,
  ): Promise<ProfileEntity>;
  abstract softDelete(id: string, userId?: string): Promise<ParentEntity>;
  abstract remove(id: string): Promise<ParentEntity>;
}
