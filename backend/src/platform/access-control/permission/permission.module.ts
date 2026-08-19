import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { PermissionController } from './presentation/permission.controller.js';
import { PrismaPermissionRepository } from './infrastructure/persistence/prisma-permission.repository.js';
import { IPermissionRepository } from './domain/interfaces/permission-repository.interface.js';
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
    { provide: IPermissionRepository, useClass: PrismaPermissionRepository },
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
export class PermissionModule implements OnApplicationBootstrap {
  constructor(private readonly syncPermissions: SyncPermissionsUseCase) {}

  /**
   * The catalogue is defined in code and has to reach every database that runs
   * it. `POST /permissions/sync` does that on request, and for a long time was
   * the only way — which made every new permission depend on someone
   * remembering a step after the deploy.
   *
   * Production is populated through the UI and never runs a seed, so a
   * permission that exists in code but not in the database cannot be granted at
   * all: it is absent from the role screen. That is a silent failure of the
   * kind this codebase has already paid for once, when a column shipped and the
   * data meant to fill it did not.
   *
   * The upsert is idempotent over a few dozen rows and this deployment runs a
   * single instance, so doing it at boot costs nothing and removes the
   * remembered step. The endpoint stays for the case where someone wants to
   * force it without a restart.
   */
  async onApplicationBootstrap(): Promise<void> {
    await this.syncPermissions.execute();
  }
}
