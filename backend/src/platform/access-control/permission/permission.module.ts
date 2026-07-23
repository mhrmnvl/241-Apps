import { Module } from '@nestjs/common';
import { PermissionController } from './presentation/permission.controller.js';
import { PermissionRepository } from './repositories/permission.repository.js';
import { IPermissionRepository } from './interfaces/permission-repository.interface.js';
import { GetPermissionsUseCase } from './use-cases/get-permissions.use-case.js';
import { GetPermissionByIdUseCase } from './use-cases/get-permission-by-id.use-case.js';
import { AssignPermissionToRoleUseCase } from './use-cases/assign-permission-to-role.use-case.js';
import { RemovePermissionFromRoleUseCase } from './use-cases/remove-permission-from-role.use-case.js';
import { SyncPermissionsUseCase } from './use-cases/sync-permissions.use-case.js';
import { CreatePermissionUseCase } from './use-cases/create-permission.use-case.js';
import { UpdatePermissionUseCase } from './use-cases/update-permission.use-case.js';
import { DeletePermissionUseCase } from './use-cases/delete-permission.use-case.js';
import { PermissionGuard } from './guards/permission.guard.js';
import { RoleModule } from '../role/role.module.js';
import { AuthModule } from '../../auth/auth.module.js';

@Module({
  imports: [RoleModule, AuthModule],
  controllers: [PermissionController],
  providers: [
    { provide: IPermissionRepository, useClass: PermissionRepository },
    GetPermissionsUseCase,
    GetPermissionByIdUseCase,
    AssignPermissionToRoleUseCase,
    RemovePermissionFromRoleUseCase,
    SyncPermissionsUseCase,
    CreatePermissionUseCase,
    UpdatePermissionUseCase,
    DeletePermissionUseCase,
    PermissionGuard,
  ],
  exports: [IPermissionRepository, PermissionGuard],
})
export class PermissionModule {}
