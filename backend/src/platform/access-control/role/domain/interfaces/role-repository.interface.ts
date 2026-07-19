import { Role, UserRole, Prisma } from '@prisma/client';

export type UserRoleWithRole = Prisma.UserRoleGetPayload<{
  include: { role: true };
}>;

export abstract class IRoleRepository {
  abstract findAll(isSuperAdmin?: boolean): Promise<Role[]>;
  abstract findById(id: string, isSuperAdmin?: boolean): Promise<Role | null>;
  abstract findByCode(code: string): Promise<Role | null>;
  abstract create(data: {
    name: string;
    code: string;
    description?: string;
  }): Promise<Role>;
  abstract update(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<Role>;
  abstract delete(id: string): Promise<Role>;
  abstract assignRoleToUser(userId: string, roleId: string): Promise<UserRole>;
  abstract removeRoleFromUser(
    userId: string,
    roleId: string,
  ): Promise<UserRole>;
  abstract findUserRole(
    userId: string,
    roleId: string,
  ): Promise<UserRole | null>;
  abstract findUserRoles(userId: string): Promise<UserRoleWithRole[]>;
}
