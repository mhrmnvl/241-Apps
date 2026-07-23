import { Permission, RolePermission, Prisma } from '@prisma/client';

export type UserRoleWithRole = Prisma.UserRoleGetPayload<{
  include: { role: true };
}>;

export abstract class IPermissionRepository {
  abstract findAll(): Promise<Permission[]>;
  abstract findById(id: string): Promise<Permission | null>;
  abstract findByCode(code: string): Promise<Permission | null>;
  abstract findUserRoles(userId: string): Promise<UserRoleWithRole[]>;
  abstract findUserPermissions(userId: string): Promise<string[]>;
  abstract findRolePermission(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission | null>;
  abstract assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission>;
  abstract removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission>;
  abstract upsertPermission(data: {
    module: string;
    action: string;
    code: string;
    description: string;
  }): Promise<Permission>;
  abstract createPermission(data: {
    module: string;
    action: string;
    code: string;
    description: string;
  }): Promise<Permission>;
  abstract updatePermission(
    id: string,
    data: { description: string },
  ): Promise<Permission>;
  abstract deletePermission(id: string): Promise<Permission>;
}
