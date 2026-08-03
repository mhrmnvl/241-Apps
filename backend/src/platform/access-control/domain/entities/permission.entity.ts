export interface PermissionEntity {
  id: string;
  module: string;
  action: string;
  code: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermissionEntity {
  roleId: string;
  permissionId: string;
}
