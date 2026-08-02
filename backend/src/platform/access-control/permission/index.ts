export { PermissionModule } from './permission.module.js';
export { IPermissionRepository } from './domain/interfaces/permission-repository.interface.js';
export { PermissionGuard } from './guards/permission.guard.js';
export {
  RequirePermissions,
  PERMISSIONS_KEY,
} from './decorators/require-permissions.decorator.js';
export { PermissionResponseDto } from './dto/response/permission-response.dto.js';
export { AssignPermissionDto } from './dto/request/assign-permission.dto.js';
export type { SystemPermission } from './types/system-permission.type.js';
