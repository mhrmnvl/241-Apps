export interface RoleEntity {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionEntity {
  id: string;
  module: string;
  action: string;
  code: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleEntity {
  userId: string;
  roleId: string;
}

/** A user-role assignment with its role resolved. */
export type UserRoleWithRoleEntity = UserRoleEntity & {
  role: RoleEntity;
};

export interface RolePermissionEntity {
  roleId: string;
  permissionId: string;
}

export type RoleWithPermissionsEntity = RoleEntity & {
  permissions: PermissionEntity[];
};
