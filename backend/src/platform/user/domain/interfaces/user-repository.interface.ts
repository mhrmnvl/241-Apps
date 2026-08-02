import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { UserEntity } from '../../../../shared/domain/entities/user.entity.js';
import { UserPublic } from '../entities/user.entity.js';

export type { UserPublic };

export interface UserQueryInput extends PaginationQueryInput {
  roleCode?: string;
  search?: string;
}

export abstract class IUserRepository {
  abstract findAll(query: UserQueryInput): Promise<PaginatedResult<UserPublic>>;

  abstract findById(id: string): Promise<UserPublic | null>;
  abstract findByIdWithPassword(id: string): Promise<UserEntity | null>;
  abstract findByIdentifier(identifier: string): Promise<UserPublic | null>;
  abstract findByIdentifierWithPassword(
    identifier: string,
  ): Promise<UserEntity | null>;
  abstract existsByIdentifier(identifier: string): Promise<boolean>;
  abstract existsById(id: string): Promise<boolean>;

  abstract create(data: {
    identifier: string;
    passwordHash: string;
  }): Promise<UserPublic>;

  abstract update(
    id: string,
    data: Partial<Pick<UserEntity, 'identifier' | 'passwordHash' | 'isActive'>>,
  ): Promise<UserPublic>;
  abstract remove(id: string): Promise<UserPublic>;
}
