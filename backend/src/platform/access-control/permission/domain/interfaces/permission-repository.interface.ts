import {
  PermissionEntity,
  RolePermissionEntity,
  UserRoleWithRoleEntity as UserRoleWithRole,
} from '../../../domain/entities/role-permission.entity.js';

export abstract class IPermissionRepository {
  abstract findAll(): Promise<PermissionEntity[]>;
  abstract findById(id: string): Promise<PermissionEntity | null>;
  abstract findByCode(code: string): Promise<PermissionEntity | null>;
  abstract findUserRoles(userId: string): Promise<UserRoleWithRole[]>;
  abstract findUserPermissions(userId: string): Promise<string[]>;
  abstract findRolePermission(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermissionEntity | null>;
  abstract assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermissionEntity>;
  abstract removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermissionEntity>;
  abstract upsertPermission(data: {
    module: string;
    action: string;
    code: string;
    description: string;
  }): Promise<PermissionEntity>;
  abstract createPermission(data: {
    module: string;
    action: string;
    code: string;
    description: string;
  }): Promise<PermissionEntity>;
  abstract updatePermission(
    id: string,
    data: { description: string },
  ): Promise<PermissionEntity>;
  abstract deletePermission(id: string): Promise<PermissionEntity>;
}
