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
  /**
   * Creates a role the code depends on, protected and with no permissions.
   *
   * Separate from `create` because the two answer different questions. `create`
   * serves the role screen, where a person is inventing a role and choosing its
   * permissions; this serves the application ensuring its own prerequisites,
   * where granting anything would be seeding by another name.
   */
  abstract createStructural(input: {
    code: string;
    name: string;
    description: string;
  }): Promise<RoleEntity>;
  /** Raises `isSystem` on a role that should never have been deletable. */
  abstract markSystem(id: string): Promise<RoleEntity>;
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
