import { Permission, Role, UserRole, Prisma } from '@prisma/client';

export type UserRoleWithRole = Prisma.UserRoleGetPayload<{
  include: { role: true };
}>;

/** A role with its granted permissions flattened into a `permissions` array. */
export type RoleWithPermissions = Role & { permissions: Permission[] };

export abstract class IRoleRepository {
  abstract findAll(isSuperAdmin?: boolean): Promise<RoleWithPermissions[]>;
  abstract findById(
    id: string,
    isSuperAdmin?: boolean,
  ): Promise<RoleWithPermissions | null>;
  abstract findByCode(code: string): Promise<Role | null>;
  abstract create(data: {
    name: string;
    code: string;
    description?: string;
    permissionIds?: string[];
  }): Promise<RoleWithPermissions>;
  abstract update(
    id: string,
    data: { name?: string; description?: string; permissionIds?: string[] },
  ): Promise<RoleWithPermissions>;
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
