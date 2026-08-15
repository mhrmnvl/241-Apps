import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { RoleController } from './presentation/role.controller.js';
import { PrismaRoleRepository } from './infrastructure/persistence/prisma-role.repository.js';
import { IRoleRepository } from './domain/interfaces/role-repository.interface.js';
import { UserModule } from '../../user/user.module.js';
import { CreateRoleUseCase } from './use-cases/create-role.use-case.js';
import { GetRolesUseCase } from './use-cases/get-roles.use-case.js';
import { GetRoleByIdUseCase } from './use-cases/get-role-by-id.use-case.js';
import { UpdateRoleUseCase } from './use-cases/update-role.use-case.js';
import { DeleteRoleUseCase } from './use-cases/delete-role.use-case.js';
import { AssignRoleToUserUseCase } from './use-cases/assign-role-to-user.use-case.js';
import { RemoveRoleFromUserUseCase } from './use-cases/remove-role-from-user.use-case.js';
import { EnsureStructuralRolesUseCase } from './use-cases/ensure-structural-roles.use-case.js';
import { AuthModule } from '../../auth/auth.module.js';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [RoleController],
  providers: [
    { provide: IRoleRepository, useClass: PrismaRoleRepository },
    CreateRoleUseCase,
    GetRolesUseCase,
    GetRoleByIdUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    AssignRoleToUserUseCase,
    RemoveRoleFromUserUseCase,
    EnsureStructuralRolesUseCase,
  ],
  exports: [IRoleRepository],
})
export class RoleModule implements OnApplicationBootstrap {
  constructor(
    private readonly ensureStructuralRoles: EnsureStructuralRolesUseCase,
  ) {}

  /**
   * Alongside the permission catalogue sync, and for the same reason: both are
   * the code's own prerequisites, and production is filled through the UI with
   * no seed to put them there.
   *
   * A missing role was not an error before this — `AccountProvisioningService`
   * skipped it and returned a user with no role, who could sign in and see an
   * empty application with nothing to explain why.
   */
  async onApplicationBootstrap(): Promise<void> {
    await this.ensureStructuralRoles.execute();
  }
}
