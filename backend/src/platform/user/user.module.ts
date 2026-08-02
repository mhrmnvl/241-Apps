import { Module } from '@nestjs/common';
import { UserController } from './presentation/user.controller.js';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';
import { CreateUserUseCase } from './use-cases/create-user.use-case.js';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case.js';
import { GetUserByIdUseCase } from './use-cases/get-user-by-id.use-case.js';
import { GetUsersUseCase } from './use-cases/get-users.use-case.js';
import { UpdateUserUseCase } from './use-cases/update-user.use-case.js';
import { IUserRepository } from './domain/interfaces/user-repository.interface.js';
import { AccountProvisioningService } from './infrastructure/account-provisioning.service.js';

@Module({
  controllers: [UserController],
  providers: [
    { provide: IUserRepository, useClass: PrismaUserRepository },
    AccountProvisioningService,
    GetUsersUseCase,
    GetUserByIdUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [IUserRepository, AccountProvisioningService],
})
export class UserModule {}
