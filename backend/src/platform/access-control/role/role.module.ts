import { Module } from '@nestjs/common';
import { RoleController } from './presentation/role.controller.js';
import { RoleRepository } from './repositories/role.repository.js';
import { IRoleRepository } from './interfaces/role-repository.interface.js';
import { UserModule } from '../../user/user.module.js';
import { CreateRoleUseCase } from './use-cases/create-role.use-case.js';
import { GetRolesUseCase } from './use-cases/get-roles.use-case.js';
import { GetRoleByIdUseCase } from './use-cases/get-role-by-id.use-case.js';
import { UpdateRoleUseCase } from './use-cases/update-role.use-case.js';
import { DeleteRoleUseCase } from './use-cases/delete-role.use-case.js';
import { AssignRoleToUserUseCase } from './use-cases/assign-role-to-user.use-case.js';
import { RemoveRoleFromUserUseCase } from './use-cases/remove-role-from-user.use-case.js';
import { AuthModule } from '../../auth/auth.module.js';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [RoleController],
  providers: [
    { provide: IRoleRepository, useClass: RoleRepository },
    CreateRoleUseCase,
    GetRolesUseCase,
    GetRoleByIdUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    AssignRoleToUserUseCase,
    RemoveRoleFromUserUseCase,
  ],
  exports: [IRoleRepository],
})
export class RoleModule {}
