import { User, Prisma } from '@prisma/client';
import { UserQueryDto } from '../../dto/request/user-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const PUBLIC_USER_SELECT = {
  id: true,
  identifier: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  userRoles: {
    select: {
      role: true,
    },
  },
} satisfies Prisma.UserSelect;

export type UserPublic = Prisma.UserGetPayload<{
  select: typeof PUBLIC_USER_SELECT;
}>;

export abstract class IUserRepository {
  abstract findAll(query: UserQueryDto): Promise<PaginatedResult<UserPublic>>;

  abstract findById(id: string): Promise<UserPublic | null>;
  abstract findByIdWithPassword(id: string): Promise<User | null>;
  abstract findByIdentifier(identifier: string): Promise<UserPublic | null>;
  abstract findByIdentifierWithPassword(
    identifier: string,
  ): Promise<User | null>;
  abstract existsByIdentifier(identifier: string): Promise<boolean>;
  abstract existsById(id: string): Promise<boolean>;

  abstract create(data: {
    identifier: string;
    passwordHash: string;
  }): Promise<UserPublic>;

  abstract update(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<UserPublic>;
  abstract remove(id: string): Promise<UserPublic>;
}
