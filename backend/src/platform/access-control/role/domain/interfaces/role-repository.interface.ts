import { PermissionEntity } from '../../../domain/entities/permission.entity.js';
import {
  RoleEntity,
  RoleWithPermissionsEntity,
  UserRoleEntity,
  UserRoleWithRoleEntity,
} from '../../../domain/entities/role.entity.js';

export type RoleWithPermissions = RoleWithPermissionsEntity;
export type UserRoleWithRole = UserRoleWithRoleEntity;

export interface CreateRoleRepositoryInput {
  name: string;
  code: string;
  description?: string;
  permissionIds?: string[];
}

/** The code identifies the role and is fixed once created. */
export interface UpdateRoleRepositoryInput {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export abstract class IRoleRepository {
  abstract findAll(isSuperAdmin?: boolean): Promise<RoleWithPermissions[]>;
  abstract findById(
    id: string,
    isSuperAdmin?: boolean,
  ): Promise<RoleWithPermissions | null>;
  abstract findByCode(code: string): Promise<RoleEntity | null>;
  abstract create(
    data: CreateRoleRepositoryInput,
  ): Promise<RoleWithPermissions>;
  abstract update(
    id: string,
    data: UpdateRoleRepositoryInput,
  ): Promise<RoleWithPermissions>;
  abstract delete(id: string): Promise<RoleEntity>;
  abstract assignRoleToUser(
    userId: string,
    roleId: string,
  ): Promise<UserRoleEntity>;
  abstract removeRoleFromUser(
    userId: string,
    roleId: string,
  ): Promise<UserRoleEntity>;
  abstract findUserRole(
    userId: string,
    roleId: string,
  ): Promise<UserRoleEntity | null>;
  abstract findUserRoles(userId: string): Promise<UserRoleWithRole[]>;
}
