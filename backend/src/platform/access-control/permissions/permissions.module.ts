import { Module } from '@nestjs/common';
import { PermissionsController } from './presentation/permissions.controller.js';
import { PermissionsRepository } from './repositories/permissions.repository.js';
import { IPermissionsRepository } from './interfaces/permissions-repository.interface.js';
import { GetPermissionsUseCase } from './use-cases/get-permissions.use-case.js';
import { GetPermissionByIdUseCase } from './use-cases/get-permission-by-id.use-case.js';
import { AssignPermissionToRoleUseCase } from './use-cases/assign-permission-to-role.use-case.js';
import { RemovePermissionFromRoleUseCase } from './use-cases/remove-permission-from-role.use-case.js';
import { SyncPermissionsUseCase } from './use-cases/sync-permissions.use-case.js';
import { CreatePermissionUseCase } from './use-cases/create-permission.use-case.js';
import { UpdatePermissionUseCase } from './use-cases/update-permission.use-case.js';
import { DeletePermissionUseCase } from './use-cases/delete-permission.use-case.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { RoleModule } from '../role/role.module.js';
import { AuthModule } from '../../auth/auth.module.js';

@Module({
  imports: [RoleModule, AuthModule],
  controllers: [PermissionsController],
  providers: [
    { provide: IPermissionsRepository, useClass: PermissionsRepository },
    GetPermissionsUseCase,
    GetPermissionByIdUseCase,
    AssignPermissionToRoleUseCase,
    RemovePermissionFromRoleUseCase,
    SyncPermissionsUseCase,
    CreatePermissionUseCase,
    UpdatePermissionUseCase,
    DeletePermissionUseCase,
    PermissionsGuard,
  ],
  exports: [IPermissionsRepository, PermissionsGuard],
})
export class PermissionsModule {}
