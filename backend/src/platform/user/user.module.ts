import { Module } from '@nestjs/common';
import { UserController } from './presentation/user.controller.js';
import { UserRepository } from './repositories/user.repository.js';
import { CreateUserUseCase } from './use-cases/create-user.use-case.js';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case.js';
import { GetUserByIdUseCase } from './use-cases/get-user-by-id.use-case.js';
import { GetUsersUseCase } from './use-cases/get-users.use-case.js';
import { UpdateUserUseCase } from './use-cases/update-user.use-case.js';
import { IUserRepository } from './interfaces/user-repository.interface.js';

@Module({
  controllers: [UserController],
  providers: [
    { provide: IUserRepository, useClass: UserRepository },
    GetUsersUseCase,
    GetUserByIdUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [IUserRepository],
})
export class UserModule {}
