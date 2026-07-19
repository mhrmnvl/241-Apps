import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';
import { IUserRepository } from '../../../user/index.js';

@Injectable()
export class RemoveRoleFromUserUseCase {
  private readonly logger = new Logger(RemoveRoleFromUserUseCase.name);

  constructor(
    private readonly rolesRepo: IRoleRepository,
    private readonly usersRepo: IUserRepository,
  ) {}

  async execute(roleId: string, userId: string) {
    const role = await this.rolesRepo.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const userExists = await this.usersRepo.existsById(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const relation = await this.rolesRepo.findUserRole(userId, roleId);
    if (!relation) {
      throw new NotFoundException('User does not have this role');
    }

    await this.rolesRepo.removeRoleFromUser(userId, roleId);
    this.logger.log(`Role ${role.code} removed from user ${userId}`);
  }
}
